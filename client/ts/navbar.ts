export function initProfileDropdown() {
    const dropdownToggle = document.getElementById('profile-dropdown-toggle');
    const dropdown = document.getElementById('profile-dropdown');
    if (!dropdownToggle || !dropdown) return;
    dropdownToggle.onclick = null;
    document.removeEventListener('click', closeDropdownOnClickOutside, true);

    dropdownToggle.onclick = function (e) {
        e.stopPropagation();
        if (dropdown.classList.contains('hidden')) {
            dropdown.classList.remove('hidden');
            dropdown.classList.add('scale-95', 'opacity-0');
            setTimeout(() => {
                dropdown.classList.remove('scale-95', 'opacity-0');
                dropdown.classList.add('scale-100', 'opacity-100');
            }, 10);
        } else {
            dropdown.classList.remove('scale-100', 'opacity-100');
            dropdown.classList.add('scale-95', 'opacity-0');
            setTimeout(() => {
                dropdown.classList.add('hidden');
            }, 200);
        }
    };
    function closeDropdownOnClickOutside(event) {
        if (!dropdownToggle.contains(event.target) && !dropdown.contains(event.target) && !dropdown.classList.contains('hidden')) {
            dropdown.classList.remove('scale-100', 'opacity-100');
            dropdown.classList.add('scale-95', 'opacity-0');
            setTimeout(() => {
                dropdown.classList.add('hidden');
            }, 200);
        }
    }
    document.addEventListener('click', closeDropdownOnClickOutside, true);
    const isLoggedIn = localStorage.getItem('user') !== null;
    dropdownToggle.style.display = isLoggedIn ? 'flex' : 'none';
}
