import Fastify from 'fastify';
import cors from '@fastify/cors';
import dotenv from 'dotenv';
import fastifyJwt from '@fastify/jwt';
import multipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import path from 'path';
import { fileURLToPath } from 'url';

import dbFunction from './db/db_auth.js';
import dbFunctionPatch from './db/db_patch.js';
import userRoutes from './routes/user.js';
import authGoogle from './routes/auth.js';
import tableFriends from './db/db_friends.js';
import friendsRoutes from './routes/friends.js';
import matchesRoutes from './routes/matches.js';
import matchesTable from './db/db_match.js';
import tournamentRoutes from './routes/tournament.js';
import tournamentLaunchRoute from './routes/launchtournament.js';
import dbTournament from './db/db_tournament.js';
import dbPong from './db/db_pong.js';
import utilsDbFunc from './db/utils.js';
import MatchData from './db/db_tournament_match.js';
import dbSnake from './db/db_snake.js';

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// -----------------------------------------------------------------------------
const fastify = Fastify({
});

fastify.register(fastifyJwt, { secret: process.env.SECRET_KEY_JWT });

fastify.register(multipart, {
  limits: { fileSize: 5 * 1024 * 1024 } // 5 Mo
});

import nodemailer from 'nodemailer';
const transporter = nodemailer.createTransport({ service: 'gmail', auth: { user: process.env.MAIL_2FA, pass: process.env.PASS_2FA } });
fastify.decorate('nodemailer', transporter);


fastify.register(cors, {
  origin: [
    /^https?:\/\/localhost(?::\d+)?$/,
    /^https?:\/\/127\.0\.0\.1(?::\d+)?$/,
  ],
  methods: ['GET','POST','PATCH','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization','Accept','Origin','X-Requested-With'],
  exposedHeaders: ['Content-Type','Authorization'],
  credentials: true
});


fastify.decorate('prevalidate', async function (request, reply) {
  try {
    await request.jwtVerify();
  } catch {
    reply.code(401).send({ error: 'Unauthorized', message: 'Invalid or missing token' });
  }
});

const avatarDir = path.join(__dirname, 'avatar');
fastify.register(fastifyStatic, { root: avatarDir, prefix: '/avatar/' });


fastify.register(dbFunction);
fastify.register(utilsDbFunc);
fastify.register(dbFunctionPatch);
fastify.register(userRoutes);
fastify.register(friendsRoutes);
fastify.register(authGoogle);
fastify.register(tableFriends);
fastify.register(MatchData);
fastify.register(matchesTable);
fastify.register(dbPong);
fastify.register(matchesRoutes);
fastify.register(tournamentRoutes);
fastify.register(tournamentLaunchRoute);
fastify.register(dbTournament);
fastify.register(dbSnake);

// -----------------------------------------------------------------------------
// Shutdown propre
const gracefulShutdown = async (signal) => {
  try { await fastify.close(); process.exit(0); }
  catch { process.exit(1); }
};
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// -----------------------------------------------------------------------------
// Boot
const start = async () => {
  const port = parseInt(process.env.PORT || '3000', 10);
  await fastify.listen({ port, host: '0.0.0.0' });
  // fastify.log.info(`http://0.0.0.0:${port} (TLS via Nginx)`);
};
start().catch((err) => { fastify.log.error(err); process.exit(1); });
