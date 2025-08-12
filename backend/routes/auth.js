import { OAuth2Client } from "google-auth-library";
import fp from "fastify-plugin";

const client = new OAuth2Client();

async function authGoogle(fastify, options) {
  const authHelper = {
    async verifyGoogleToken(token) {
      const client_id = process.env.VITE_GOOGLE_CLIENT_ID;
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: client_id,
      });
      const payload = ticket.getPayload();
      return {
        googleId: payload.sub,
        email: payload.email,
        fullname: payload.name,
        firstName: payload.given_name,
        lastName: payload.family_name,
        picture: payload.picture,
      };
    },

    async createJWTtoken(user) {
      const token = fastify.jwt.sign({
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 60 * 60,
      });
      return token;
    },

    async verifyJWT(request, reply) {
      try {
        await request.jwtVerify();
      } catch (err) {
        reply
          .code(401)
          .send({ success: false, message: "Token invalide ou manquant" });
      }
    },
  };
  fastify.decorate("auth", authHelper);

  fastify.post("/auth/google", async (request, reply) => {
    try {
      const { token } = request.body;
      // console.log(token);
      const userInfo = await authHelper.verifyGoogleToken(token);
      const user = await fastify.db.registerUser(
        userInfo.googleId,
        userInfo.email,
        null,
        null,
        userInfo.picture
      );
      // console.log("User found or created:", user);
      if (user && user.username) {
        const jwt = await fastify.auth.createJWTtoken(user);
        // console.log("User authenticated with Google:", user);
        // console.log(jwt);
        reply.send({ user, jwt });
      }
      else if (user && !user.username) {
        reply.send({ user });
      } else
        reply.status(401).send({
          success: false,
          message: "Couldn't create or retrieve user",
        });
    } catch (err) {
      reply
        .status(401)
        .send({ success: false, message: "Token Google invalide" });
    }
  });

  fastify.post("/auth/google-username", async (request, reply) => {
    try {
      const { username, userData } = request.body;
      const googleId = userData.googleId;
      const result = await fastify.dbPatch.addUsernameGoogle(googleId, username);
      // console.log("Setting username for Google user:", result.jwt);
      reply.send({ success: true, jwt: result.jwt });
    } catch (err) {
      reply.status(401).send({
        success: false,
        message: "Error setting username for Google user",
        error: err.message,
      });
    }
  });

  fastify.post("/auth/login", async (request, reply) => {
    try {
      const { email, password } = request.body;
      const user = await fastify.db.loginUser(email, password);
      if (!user)
        reply
          .status(401)
          .send({ success: false, message: "Couldn't find user" });

      const jwt = await fastify.auth.createJWTtoken(user);
        // console.log(jwt);
      if(user.is_2fa_activated)
      {
        // console.log("2FA activated for user:", user.email);
        reply.send({user});
      }
      else
      {
        const jwt = await fastify.auth.createJWTtoken(user);
        // console.log(jwt);
        reply.send({success : true, jwt, user });
      }
    } catch (err) {
      reply
        .status(401)
        .send({ success: false, message: err.message});
    }
  });

  fastify.post("/auth/2FA-code", async (request, reply) => {
    try {
      const { email } = request.body;
      const user = await fastify.utilsDb.checkEmail(email);
      if (!user) {
        return reply.status(404).send({
          success: false,
          message: "Utilisateur non trouvé",
        });
      }
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      if (!fastify.twoFactorCodes) fastify.twoFactorCodes = new Map();
      fastify.twoFactorCodes.set(email, {
        code,
        expiresAt: Date.now() + 1 * 60 * 1000,
        user: user,
      });
      await fastify.nodemailer.sendMail({
          from: process.env.MAIL_2FA,
          to: email,
          subject: 'Your verification code',
          text: `Your verification code is: ${code}`,
          html: `<p>Voici votre code de verification: <b>${code}</b></p>`
      });
      // console.log(code, email);
      return reply.send({
        success: true,
        message: "Code envoyé avec succès",
      });
    } catch (err) {
      // console.error("Erreur d'envoi de code:", err);
      return reply.status(500).send({
        success: false,
        message: "Erreur lors de l'envoi du code",
        error: err.message,
      });
    }
  });

  fastify.post("/auth/2FA-verify", async (request, reply) => {
    const { email, code } = request.body;
    const real_code = fastify.twoFactorCodes.get(email);
    if (Date.now() > real_code.expiresAt) {
      fastify.twoFactorCodes.delete(email);
      reply.status(400).send({
        success: false,
        message: "Verification code has expired. Please relogin",
      });
      return;
    } else if (code != real_code.code) {
      reply.status(400).send({
        success: false,
        message: "Verification code is wrong. Please retry",
      });
      return;
    } else if (code == real_code.code) {
      const jwt = await fastify.auth.createJWTtoken(real_code.user);
      fastify.twoFactorCodes.delete(email);
      reply.send({ success: true, jwt, user: real_code.user });
    }
  });

  fastify.post("/auth/register", async (request, reply) => {
    try {
      const { email, password, pseudo: username } = request.body;
      const user = await fastify.db.registerUser(
        null,
        email,
        password,
        username,
        null
      );
      if (user) {
        const jwt = await fastify.auth.createJWTtoken(user);
        reply.send({success : true, jwt, user });
      } else {
        reply
          .status(401)
          .send({ success: false, message: "Couldn't authenticate user" });
      }
    } catch (err) {
      reply.status(401).send({
        success: false,
        message: err.message
      });
    }
  });

  fastify.patch(
    "/auth/change-password",
    { preValidation: [fastify.prevalidate] },
    async (request, reply) => {
      try {
        // console.log("Changing password for user:", request.user.email);
        const { currpass, newpassword } = request.body;
        await fastify.dbPatch.changePassword(request.user.email, currpass, newpassword);
        reply.send({ success: true, message: "Password changed" });
      } catch (err) {
        reply.status(401).send({ success: false, message: err.message });
      }
    }
  );

  fastify.patch(
    "/auth/reset-password",
    { preValidation: [fastify.prevalidate] },
    async (request, reply) => {
      try {
        // console.log("Reseting password for user:", request.user.email);
        const { password } = request.body;
        await fastify.dbPatch.resetPassword(request.user.email, password);
        reply.send({ success: true, message: "Password changed" });
      } catch (err) {
        reply.status(401).send({ success: false, message: err.message });
      }
    }
  );

  fastify.patch('/auth/reset-new-password', async (request, reply) => {
    try {
      // console.log("Reseting new password for user:", request.body.email);
      const { email, password } = request.body;
      if (!email || !password) {
        return reply.status(400).send({
          success: false,
          message: "Email and password are required",
        });
      }
      const user = await fastify.utilsDb.checkEmail(email);
      if (!user) {
        return reply.status(404).send({
          success: false,
          message: "Utilisateur non trouvé",
        });
      }
      await fastify.dbPatch.resetPassword(email, password);
      reply.send({ success: true, message: "Password changed" });
    } catch (err) {
      // console.error("Error resetting password:", err);
      reply.status(500).send({
        success: false,
        message: "Erreur lors de la réinitialisation du mot de passe",
        error: err.message,
      });
    }
  });

  fastify.post("/auth/2FA-code/pass", async (request, reply) => {
    try {

      // console.log("Sending 2FA code to email:");
      const { email } = request.body;
      // console.log("Email:", email);
      const user = await fastify.utilsDb.checkEmail(email);
      if (!user) {
        return reply.status(404).send({
          success: false,
          message: "Utilisateur non trouvé",
        });
      }
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      if (!fastify.twoFactorCodes) fastify.twoFactorCodes = new Map();
      fastify.twoFactorCodes.set(email, {
        code,
        expiresAt: Date.now() + 1 * 60 * 1000,
        user: user,
      });
      await fastify.nodemailer.sendMail({
          from: process.env.MAIL_2FA,
          to: email,
          subject: 'Your verification code',
          text: `Your verification code is: ${code}`,
          html: `<p>Voici votre code de verification: <b>${code}</b></p>`
      });
      // console.log(code, email);
      return reply.send({
        success: true,
        message: "Code envoyé avec succès",
      });
    } catch (err) {
      // console.error("Erreur d'envoi de code:", err);
      return reply.status(500).send({
        success: false,
        message: "Erreur lors de l'envoi du code",
        error: err.message,
      });
    }
  });

  fastify.post("/auth/2FA-verify/pass", async (request, reply) => {
    // console.log("Verifying 2FA code for email:", request.body.email);
    const { email, code } = request.body;
    if (!fastify.twoFactorCodes) {
      return reply.status(404).send({
        success: false,
        message: "Verification code not found",
      });
    }
    const real_code = fastify.twoFactorCodes.get(email);
    try {
      if (Date.now() > real_code.expiresAt) {
        fastify.twoFactorCodes.delete(email);
        reply.status(400).send({
          success: false,
          message: "Verification code has expired. Please relogin",
        });
        return;
      } else if (code != real_code.code) {
        reply.status(400).send({
          success: false,
          message: "Verification code is wrong. Please retry",
        });
        return;
      } else if (code == real_code.code) {
        fastify.twoFactorCodes.delete(email);
        reply.send({ success:true, message: "2FA code verified"});
      }
    }
    catch (err)
    {
      reply.status(403).send({
        success: false,
        message: "Error verifying 2FA code",
        error: err.message,
      });
    }
  });

  fastify.get("/check-jwt", {preValidation : fastify.prevalidate}, async (request, reply) => {
    reply.status(200).send({ success: true });
  });

}

export default fp(authGoogle);