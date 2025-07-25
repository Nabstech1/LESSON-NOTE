document.addEventListener('DOMContentLoaded', function() {
    const links = document.querySelectorAll('.sidebar nav ul li a');
    const dashboardContent = document.getElementById('dashboard-content');

    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            links.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            const section = this.getAttribute('href').substring(1);
            loadSection(section);
        });
    });

    function loadSection(section) {
        // Remove glassy/bg classes by default
        dashboardContent.classList.remove('create-account-bg');
        switch(section) {
            case 'dashboard':
                dashboardContent.innerHTML = `
                    <h1>Welcome, Superadmin</h1>
                    <div class="dashboard-widgets">
                        <div class="widget">System Stats (Coming Soon)</div>
                        <div class="widget">User Activity (Coming Soon)</div>
                    </div>
                `;
                break;
            case 'create-account':
                dashboardContent.classList.add('create-account-bg');
                dashboardContent.innerHTML = `
                    <h1 style="text-align:center;color:#b71c1c;">Create Account</h1>
                    <form id="superadmin-create-user-form" class="superadmin-form glassy">
                        <div class="form-group">
                            <label for="name">Name</label>
                            <input type="text" id="name" required />
                        </div>
                        <div class="form-group">
                            <label for="email">Email</label>
                            <input type="email" id="email" required />
                        </div>
                        <div class="form-group">
                            <label for="password">Password</label>
                            <input type="password" id="password" required minlength="6" />
                        </div>
                        <div class="form-group">
                            <label for="role">Role</label>
                            <select id="role" required>
                                <option value="">Select Role</option>
                                <option value="admin">Admin</option>
                                <option value="regional">Regional</option>
                                <option value="national">National</option>
                                <option value="teacher">Teacher</option>
                                <option value="superadmin">Superadmin</option>
                            </select>
                        </div>
                        <button type="submit" class="submit-btn">Create Account</button>
                        <div id="status-message" class="status-message"></div>
                    </form>
                `;
                attachCreateUserFormHandler();
                break;
            case 'manage-accounts':
                dashboardContent.innerHTML = `
                    <h1>Manage Accounts</h1>
                    <div id="account-stats" class="account-stats" style="margin-bottom:24px;"></div>
                    <div class="user-search-bar-container">
                        <input type="text" id="user-search-bar" class="user-search-bar" placeholder="Search by name..." />
                    </div>
                    <div class="user-table-container"><div class="loading-users">Loading users...</div></div>`;
                loadAccountStats();
                loadUsersTable();
                break;
            case 'classes':
                dashboardContent.innerHTML = `
                    <h1>Manage Classes</h1>
                    <form id="create-class-form" class="superadmin-form glassy" style="max-width:420px;margin:0 auto 32px auto;">
                        <div class="form-group">
                            <label for="class_name">Class Name</label>
                            <input type="text" id="class_name" required />
                        </div>
                        <div class="form-group">
                            <label for="section">Section</label>
                            <input type="text" id="section" required />
                        </div>
                        <button type="submit" class="submit-btn">Add Class</button>
                        <div id="class-status-message" class="status-message"></div>
                    </form>
                    <div class="class-table-container"><div class="loading-classes">Loading classes...</div></div>`;
                loadClassesTable();
                document.getElementById('create-class-form').onsubmit = async function(e) {
                    e.preventDefault();
                    const class_name = document.getElementById('class_name').value.trim();
                    const section = document.getElementById('section').value.trim();
                    const statusMsg = document.getElementById('class-status-message');
                    statusMsg.textContent = '';
                    statusMsg.className = 'status-message';
                    try {
                        const res = await fetch('http://localhost:3000/api/classes', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ class_name, section })
                        });
                        const data = await res.json();
                        if (res.ok) {
                            statusMsg.textContent = 'Class added successfully!';
                            statusMsg.classList.add('success');
                            this.reset();
                            loadClassesTable();
                        } else {
                            statusMsg.textContent = data.error || 'Failed to add class.';
                            statusMsg.classList.add('error');
                        }
                    } catch (err) {
                        statusMsg.textContent = 'Server error. Please try again.';
                        statusMsg.classList.add('error');
                    }
                };
                break;
            case 'activities':
                dashboardContent.innerHTML = `<h1>Manage Activities</h1><div>(Activity management will go here)</div>`;
                break;
            case 'forecasts':
                dashboardContent.innerHTML = `<h1>Manage Forecasts</h1><div>(Forecast management will go here)</div>`;
                break;
            case 'settings':
                dashboardContent.innerHTML = `
                    <h1>Manage Regions, Zones, and Circuits</h1>
                    <div class="hierarchy-section">
                        <h2>Regions</h2>
                        <form id="create-region-form" class="superadmin-form glassy" style="max-width:420px;margin:0 auto 24px auto;">
                            <div class="form-group">
                                <label for="region-name">Region Name</label>
                                <input type="text" id="region-name" required />
                            </div>
                            <button type="submit" class="submit-btn">Add Region</button>
                            <div id="region-status-message" class="status-message"></div>
                        </form>
                        <div class="region-table-container"><div class="loading-regions">Loading regions...</div></div>
                    </div>
                    <div class="hierarchy-section">
                        <h2>Zones</h2>
                        <form id="create-zone-form" class="superadmin-form glassy" style="max-width:420px;margin:0 auto 24px auto;">
                            <div class="form-group">
                                <label for="zone-name">Zone Name</label>
                                <input type="text" id="zone-name" required />
                            </div>
                            <div class="form-group">
                                <label for="zone-region">Region</label>
                                <select id="zone-region" required></select>
                            </div>
                            <button type="submit" class="submit-btn">Add Zone</button>
                            <div id="zone-status-message" class="status-message"></div>
                        </form>
                        <div class="zone-table-container"><div class="loading-zones">Loading zones...</div></div>
                    </div>
                    <div class="hierarchy-section">
                        <h2>Circuits</h2>
                        <form id="create-circuit-form" class="superadmin-form glassy" style="max-width:420px;margin:0 auto 24px auto;">
                            <div class="form-group">
                                <label for="circuit-name">Circuit Name</label>
                                <input type="text" id="circuit-name" required />
                            </div>
                            <div class="form-group">
                                <label for="circuit-zone">Zone</label>
                                <select id="circuit-zone" required></select>
                            </div>
                            <button type="submit" class="submit-btn">Add Circuit</button>
                            <div id="circuit-status-message" class="status-message"></div>
                        </form>
                        <div class="circuit-table-container"><div class="loading-circuits">Loading circuits...</div></div>
                    </div>
                `;
                loadRegionsZonesCircuits();
                break;
            default:
                dashboardContent.innerHTML = `<h1>Welcome, Superadmin</h1>`;
        }
    }

    function attachCreateUserFormHandler() {
        const form = document.getElementById('superadmin-create-user-form');
        if (!form) return;
        form.onsubmit = async function(e) {
            e.preventDefault();
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const role = document.getElementById('role').value;
            const statusMsg = document.getElementById('status-message');
            statusMsg.textContent = '';
            statusMsg.className = 'status-message';
            try {
                const res = await fetch('http://localhost:3000/api/create-user', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password, role })
                });
                const data = await res.json();
                if (res.ok) {
                    statusMsg.textContent = 'User created successfully!';
                    statusMsg.classList.add('success');
                    form.reset();
                } else {
                    statusMsg.textContent = data.error || 'Failed to create user.';
                    statusMsg.classList.add('error');
                }
            } catch (err) {
                statusMsg.textContent = 'Server error. Please try again.';
                statusMsg.classList.add('error');
            }
        };
    }

    function loadUsersTable() {
        const container = dashboardContent.querySelector('.user-table-container');
        const searchInput = dashboardContent.querySelector('#user-search-bar');
        fetch('http://localhost:3000/api/users')
            .then(res => res.json())
            .then(users => {
                if (!Array.isArray(users) || users.length === 0) {
                    container.innerHTML = '<div class="no-users">No users found.</div>';
                    return;
                }
                let filteredUsers = users;
                function renderTable() {
                    let table = `<table class="user-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Created At</th>
                                <th>ASSIGNED TO</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                    `;
                    filteredUsers.forEach(user => {
                        let assigned = [];
                        if (user.circuit_name) assigned.push(`Circuit: ${user.circuit_name}`);
                        if (user.zone_name) assigned.push(`Zone: ${user.zone_name}`);
                        if (user.region_name) assigned.push(`Region: ${user.region_name}`);
                        let assignedStr = assigned.length ? assigned.join(', ') : '-';
                        table += `<tr>
                            <td>${user.name}</td>
                            <td>${user.email}</td>
                            <td>${user.role}</td>
                            <td>${new Date(user.created_at).toLocaleString()}</td>
                            <td>${assignedStr}</td>
                            <td>
                                <button class="edit-btn" data-id="${user.id}">Edit</button>
                                <button class="delete-btn" data-id="${user.id}">Delete</button>
                                <button class="assign-btn" data-id="${user.id}">Assign</button>
                                <button class="about-btn" data-id="${user.id}">About</button>
                            </td>
                        </tr>`;
                    });
                    table += '</tbody></table>';
                    container.innerHTML = table;
                    // Add event listeners for edit/delete
                    container.querySelectorAll('.edit-btn').forEach(btn => {
                        btn.addEventListener('click', function() {
                            const userId = this.getAttribute('data-id');
                            const user = filteredUsers.find(u => u.id == userId);
                            if (!user) return;
                            showEditUserModal(user);
                        });
                    });
                    container.querySelectorAll('.delete-btn').forEach(btn => {
                        btn.addEventListener('click', function() {
                            const userId = this.getAttribute('data-id');
                            if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
                                this.disabled = true;
                                fetch(`http://localhost:3000/api/users/${userId}`, {
                                    method: 'DELETE'
                                })
                                .then(res => res.json())
                                .then(result => {
                                    if (result.success) {
                                        loadUsersTable();
                                    } else {
                                        alert(result.error || 'Failed to delete user.');
                                        this.disabled = false;
                                    }
                                })
                                .catch(() => {
                                    alert('Server error. Please try again.');
                                    this.disabled = false;
                                });
                            }
                        });
                    });
                    // Add event listeners for assign
                    container.querySelectorAll('.assign-btn').forEach(btn => {
                        btn.addEventListener('click', function() {
                            const userId = this.getAttribute('data-id');
                            const user = filteredUsers.find(u => u.id == userId);
                            if (!user) return;
                            showAssignUserModal(user);
                        });
                    });
                    // Add event listeners for about
                    container.querySelectorAll('.about-btn').forEach(btn => {
                        btn.addEventListener('click', function() {
                            const userId = this.getAttribute('data-id');
                            const user = filteredUsers.find(u => u.id == userId);
                            if (!user) return;
                            showAboutUserModal(user);
                        });
                    });
                }
                renderTable();
                if (searchInput) {
                    searchInput.addEventListener('input', function() {
                        const val = this.value.trim().toLowerCase();
                        filteredUsers = users.filter(u => u.name.toLowerCase().includes(val));
                        renderTable();
                    });
                }
            })
            .catch(err => {
                container.innerHTML = '<div class="error-users">Failed to load users.</div>';
            });
    }

    // Modal for editing user
    function showEditUserModal(user) {
        // Remove any existing modal
        let modal = document.getElementById('edit-user-modal');
        if (modal) modal.remove();
        modal = document.createElement('div');
        modal.id = 'edit-user-modal';
        modal.innerHTML = `
            <div class="modal-backdrop" style="z-index:1000;"></div>
            <div class="modal-content" tabindex="-1" style="z-index:1001; pointer-events: auto;">
                <button class="close-btn" id="close-edit-modal">&times;</button>
                <h2>Edit User</h2>
                <form id="edit-user-form">
                    <div class="form-group">
                        <label for="edit-name">Name</label>
                        <input type="text" id="edit-name" value="${user.name}" required />
                    </div>
                    <div class="form-group">
                        <label for="edit-email">Email</label>
                        <input type="email" id="edit-email" value="${user.email}" required />
                    </div>
                    <div class="form-group">
                        <label for="edit-role">Role</label>
                        <select id="edit-role" required>
                            <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
                            <option value="regional" ${user.role === 'regional' ? 'selected' : ''}>Regional</option>
                            <option value="national" ${user.role === 'national' ? 'selected' : ''}>National</option>
                            <option value="teacher" ${user.role === 'teacher' ? 'selected' : ''}>Teacher</option>
                            <option value="superadmin" ${user.role === 'superadmin' ? 'selected' : ''}>Superadmin</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="edit-password">Password (leave blank to keep unchanged)</label>
                        <input type="password" id="edit-password" minlength="6" />
                    </div>
                    <button type="submit" class="submit-btn">Save Changes</button>
                    <div id="edit-status-message" class="status-message"></div>
                </form>
            </div>
        `;
        document.body.appendChild(modal);
        // Do not auto-focus modal content (was causing freeze in some browsers)
        // setTimeout(() => {
        //     const content = modal.querySelector('.modal-content');
        //     if (content) content.focus();
        // }, 10);
        // Close modal on close button
        document.getElementById('close-edit-modal').onclick = () => modal.remove();
        // Close modal on backdrop click
        modal.querySelector('.modal-backdrop').onclick = () => modal.remove();
        // Prevent click inside modal-content from closing modal
        modal.querySelector('.modal-content').onclick = e => e.stopPropagation();
        document.getElementById('edit-user-form').onsubmit = async function(e) {
            e.preventDefault();
            const name = document.getElementById('edit-name').value.trim();
            const email = document.getElementById('edit-email').value.trim();
            const role = document.getElementById('edit-role').value;
            const password = document.getElementById('edit-password').value;
            const statusMsg = document.getElementById('edit-status-message');
            statusMsg.textContent = '';
            statusMsg.className = 'status-message';
            try {
                const res = await fetch(`http://localhost:3000/api/users/${user.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, role, ...(password ? { password } : {}) })
                });
                const data = await res.json();
                if (res.ok) {
                    statusMsg.textContent = 'User updated successfully!';
                    statusMsg.classList.add('success');
                    setTimeout(() => {
                        modal.remove();
                        loadUsersTable();
                    }, 900);
                } else {
                    statusMsg.textContent = data.error || 'Failed to update user.';
                    statusMsg.classList.add('error');
                }
            } catch (err) {
                statusMsg.textContent = 'Server error. Please try again.';
                statusMsg.classList.add('error');
            }
        };
    }

    function loadClassesTable() {
        const container = dashboardContent.querySelector('.class-table-container');
        fetch('http://localhost:3000/api/classes')
            .then(res => res.json())
            .then(classes => {
                if (!Array.isArray(classes) || classes.length === 0) {
                    container.innerHTML = '<div class="no-classes">No classes found.</div>';
                    return;
                }
                let table = `<table class="user-table">
                    <thead>
                        <tr>
                            <th>Class Name</th>
                            <th>Section</th>
                            <th>Created At</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                `;
                classes.forEach(cls => {
                    table += `<tr>
                        <td>${cls.class_name}</td>
                        <td>${cls.section}</td>
                        <td>${new Date(cls.created_at).toLocaleString()}</td>
                        <td>
                            <button class="edit-class-btn" data-id="${cls.id}">Edit</button>
                            <button class="delete-class-btn" data-id="${cls.id}">Delete</button>
                        </td>
                    </tr>`;
                });
                table += '</tbody></table>';
                container.innerHTML = table;
                // Edit class
                container.querySelectorAll('.edit-class-btn').forEach(btn => {
                    btn.addEventListener('click', function() {
                        const classId = this.getAttribute('data-id');
                        const cls = classes.find(c => c.id == classId);
                        if (!cls) return;
                        showEditClassModal(cls);
                    });
                });
                // Delete class
                container.querySelectorAll('.delete-class-btn').forEach(btn => {
                    btn.addEventListener('click', function() {
                        const classId = this.getAttribute('data-id');
                        if (confirm('Are you sure you want to delete this class? This action cannot be undone.')) {
                            this.disabled = true;
                            fetch(`http://localhost:3000/api/classes/${classId}`, {
                                method: 'DELETE'
                            })
                            .then(res => res.json())
                            .then(result => {
                                if (result.success) {
                                    loadClassesTable();
                                } else {
                                    alert(result.error || 'Failed to delete class.');
                                    this.disabled = false;
                                }
                            })
                            .catch(() => {
                                alert('Server error. Please try again.');
                                this.disabled = false;
                            });
                        }
                    });
                });
            })
            .catch(err => {
                container.innerHTML = '<div class="error-classes">Failed to load classes.</div>';
            });
    }

    function showEditClassModal(cls) {
        let modal = document.getElementById('edit-class-modal');
        if (modal) modal.remove();
        modal = document.createElement('div');
        modal.id = 'edit-class-modal';
        modal.innerHTML = `
            <div class="modal-backdrop" style="z-index:1000;"></div>
            <div class="modal-content" tabindex="-1" style="z-index:1001; pointer-events: auto;">
                <button class="close-btn" id="close-edit-class-modal">&times;</button>
                <h2>Edit Class</h2>
                <form id="edit-class-form">
                    <div class="form-group">
                        <label for="edit-class-name">Class Name</label>
                        <input type="text" id="edit-class-name" value="${cls.class_name}" required />
                    </div>
                    <div class="form-group">
                        <label for="edit-section">Section</label>
                        <input type="text" id="edit-section" value="${cls.section}" required />
                    </div>
                    <button type="submit" class="submit-btn">Save Changes</button>
                    <div id="edit-class-status-message" class="status-message"></div>
                </form>
            </div>
        `;
        document.body.appendChild(modal);
        document.getElementById('close-edit-class-modal').onclick = () => modal.remove();
        modal.querySelector('.modal-backdrop').onclick = () => modal.remove();
        modal.querySelector('.modal-content').onclick = e => e.stopPropagation();
        document.getElementById('edit-class-form').onsubmit = async function(e) {
            e.preventDefault();
            const class_name = document.getElementById('edit-class-name').value.trim();
            const section = document.getElementById('edit-section').value.trim();
            const statusMsg = document.getElementById('edit-class-status-message');
            statusMsg.textContent = '';
            statusMsg.className = 'status-message';
            try {
                const res = await fetch(`http://localhost:3000/api/classes/${cls.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ class_name, section })
                });
                const data = await res.json();
                if (res.ok) {
                    statusMsg.textContent = 'Class updated successfully!';
                    statusMsg.classList.add('success');
                    setTimeout(() => {
                        modal.remove();
                        loadClassesTable();
                    }, 900);
                } else {
                    statusMsg.textContent = data.error || 'Failed to update class.';
                    statusMsg.classList.add('error');
                }
            } catch (err) {
                statusMsg.textContent = 'Server error. Please try again.';
                statusMsg.classList.add('error');
            }
        };
    }

    function loadRegionsZonesCircuits() {
        // Fetch all regions, zones, and circuits
        let regions = [], zones = [], circuits = [];
        const fetchAll = () => Promise.all([
            fetch('http://localhost:3000/api/regions').then(r => r.json()),
            fetch('http://localhost:3000/api/zones').then(r => r.json()),
            fetch('http://localhost:3000/api/circuits').then(r => r.json())
        ]);
        const render = () => {
            window.lastRegionsList = regions;
            window.lastZonesList = zones;
            // Populate region dropdowns
            const zoneRegionSelect = document.getElementById('zone-region');
            if (zoneRegionSelect) {
                zoneRegionSelect.innerHTML = '<option value="">Select Region</option>' +
                    regions.map(r => `<option value="${r.id}">${r.name}</option>`).join('');
            }
            // Populate zone dropdowns
            const circuitZoneSelect = document.getElementById('circuit-zone');
            if (circuitZoneSelect) {
                circuitZoneSelect.innerHTML = '<option value="">Select Zone</option>' +
                    zones.map(z => `<option value="${z.id}">${z.name}</option>`).join('');
            }
            // Render region table
            const regionTable = document.querySelector('.region-table-container');
            if (regionTable) {
                let table = `<table class="user-table"><thead><tr><th>Name</th><th>Actions</th></tr></thead><tbody>`;
                regions.forEach(region => {
                    table += `<tr><td>${region.name}</td><td>
                        <button class="edit-region-btn" data-id="${region.id}">Edit</button>
                        <button class="delete-region-btn" data-id="${region.id}">Delete</button>
                    </td></tr>`;
                });
                table += '</tbody></table>';
                regionTable.innerHTML = table;
            }
            // Render zone table
            const zoneTable = document.querySelector('.zone-table-container');
            if (zoneTable) {
                let table = `<table class="user-table"><thead><tr><th>Name</th><th>Region</th><th>Actions</th></tr></thead><tbody>`;
                zones.forEach(zone => {
                    const region = regions.find(r => r.id === zone.region_id) || {};
                    table += `<tr><td>${zone.name}</td><td>${region.name || ''}</td><td>
                        <button class="edit-zone-btn" data-id="${zone.id}">Edit</button>
                        <button class="delete-zone-btn" data-id="${zone.id}">Delete</button>
                    </td></tr>`;
                });
                table += '</tbody></table>';
                zoneTable.innerHTML = table;
            }
            // Render circuit table
            const circuitTable = document.querySelector('.circuit-table-container');
            if (circuitTable) {
                let table = `<table class="user-table"><thead><tr><th>Name</th><th>Zone</th><th>Actions</th></tr></thead><tbody>`;
                circuits.forEach(circuit => {
                    const zone = zones.find(z => z.id === circuit.zone_id) || {};
                    table += `<tr><td>${circuit.name}</td><td>${zone.name || ''}</td><td>
                        <button class="edit-circuit-btn" data-id="${circuit.id}">Edit</button>
                        <button class="delete-circuit-btn" data-id="${circuit.id}">Delete</button>
                    </td></tr>`;
                });
                table += '</tbody></table>';
                circuitTable.innerHTML = table;
            }
            // Add event listeners for edit/delete
            document.querySelectorAll('.edit-region-btn').forEach(btn => {
                btn.onclick = () => showEditRegionModal(regions.find(r => r.id == btn.dataset.id));
            });
            document.querySelectorAll('.delete-region-btn').forEach(btn => {
                btn.onclick = () => deleteRegion(btn.dataset.id);
            });
            document.querySelectorAll('.edit-zone-btn').forEach(btn => {
                btn.onclick = () => showEditZoneModal(zones.find(z => z.id == btn.dataset.id));
            });
            document.querySelectorAll('.delete-zone-btn').forEach(btn => {
                btn.onclick = () => deleteZone(btn.dataset.id);
            });
            document.querySelectorAll('.edit-circuit-btn').forEach(btn => {
                btn.onclick = () => showEditCircuitModal(circuits.find(c => c.id == btn.dataset.id));
            });
            document.querySelectorAll('.delete-circuit-btn').forEach(btn => {
                btn.onclick = () => deleteCircuit(btn.dataset.id);
            });
        };
        // Fetch and render all
        fetchAll().then(([r, z, c]) => {
            regions = r; zones = z; circuits = c; render();
        });
        // Create region
        document.getElementById('create-region-form').onsubmit = async function(e) {
            e.preventDefault();
            const name = document.getElementById('region-name').value.trim();
            const statusMsg = document.getElementById('region-status-message');
            statusMsg.textContent = '';
            statusMsg.className = 'status-message';
            try {
                const res = await fetch('http://localhost:3000/api/regions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name })
                });
                const data = await res.json();
                if (res.ok) {
                    statusMsg.textContent = 'Region added successfully!';
                    statusMsg.classList.add('success');
                    this.reset();
                    fetchAll().then(([r, z, c]) => { regions = r; zones = z; circuits = c; render(); });
                } else {
                    statusMsg.textContent = data.error || 'Failed to add region.';
                    statusMsg.classList.add('error');
                }
            } catch (err) {
                statusMsg.textContent = 'Server error. Please try again.';
                statusMsg.classList.add('error');
            }
        };
        // Create zone
        document.getElementById('create-zone-form').onsubmit = async function(e) {
            e.preventDefault();
            const name = document.getElementById('zone-name').value.trim();
            const region_id = document.getElementById('zone-region').value;
            const statusMsg = document.getElementById('zone-status-message');
            statusMsg.textContent = '';
            statusMsg.className = 'status-message';
            try {
                const res = await fetch('http://localhost:3000/api/zones', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, region_id })
                });
                const data = await res.json();
                if (res.ok) {
                    statusMsg.textContent = 'Zone added successfully!';
                    statusMsg.classList.add('success');
                    this.reset();
                    fetchAll().then(([r, z, c]) => { regions = r; zones = z; circuits = c; render(); });
                } else {
                    statusMsg.textContent = data.error || 'Failed to add zone.';
                    statusMsg.classList.add('error');
                }
            } catch (err) {
                statusMsg.textContent = 'Server error. Please try again.';
                statusMsg.classList.add('error');
            }
        };
        // Create circuit
        document.getElementById('create-circuit-form').onsubmit = async function(e) {
            e.preventDefault();
            const name = document.getElementById('circuit-name').value.trim();
            const zone_id = document.getElementById('circuit-zone').value;
            const statusMsg = document.getElementById('circuit-status-message');
            statusMsg.textContent = '';
            statusMsg.className = 'status-message';
            try {
                const res = await fetch('http://localhost:3000/api/circuits', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, zone_id })
                });
                const data = await res.json();
                if (res.ok) {
                    statusMsg.textContent = 'Circuit added successfully!';
                    statusMsg.classList.add('success');
                    this.reset();
                    fetchAll().then(([r, z, c]) => { regions = r; zones = z; circuits = c; render(); });
                } else {
                    statusMsg.textContent = data.error || 'Failed to add circuit.';
                    statusMsg.classList.add('error');
                }
            } catch (err) {
                statusMsg.textContent = 'Server error. Please try again.';
                statusMsg.classList.add('error');
            }
        };
    }

    function showEditRegionModal(region) {
        let modal = document.getElementById('edit-region-modal');
        if (modal) modal.remove();
        modal = document.createElement('div');
        modal.id = 'edit-region-modal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-backdrop"></div>
            <div class="modal-content" tabindex="-1">
                <button class="close-btn" id="close-edit-region-modal">&times;</button>
                <h2>Edit Region</h2>
                <form id="edit-region-form">
                    <div class="form-group">
                        <label for="edit-region-name">Region Name</label>
                        <input type="text" id="edit-region-name" value="${region.name}" required />
                    </div>
                    <button type="submit" class="submit-btn">Save Changes</button>
                    <div id="edit-region-status-message" class="status-message"></div>
                </form>
            </div>
        `;
        document.querySelector('.superadmin-container').appendChild(modal);
        document.getElementById('close-edit-region-modal').onclick = () => modal.remove();
        modal.querySelector('.modal-backdrop').onclick = () => modal.remove();
        modal.querySelector('.modal-content').onclick = e => e.stopPropagation();
        document.getElementById('edit-region-form').onsubmit = async function(e) {
            e.preventDefault();
            const name = document.getElementById('edit-region-name').value.trim();
            const statusMsg = document.getElementById('edit-region-status-message');
            statusMsg.textContent = '';
            statusMsg.className = 'status-message';
            try {
                const res = await fetch(`http://localhost:3000/api/regions/${region.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name })
                });
                const data = await res.json();
                if (res.ok) {
                    statusMsg.textContent = 'Region updated successfully!';
                    statusMsg.classList.add('success');
                    setTimeout(() => {
                        modal.remove();
                        loadRegionsZonesCircuits();
                    }, 900);
                } else {
                    statusMsg.textContent = data.error || 'Failed to update region.';
                    statusMsg.classList.add('error');
                }
            } catch (err) {
                statusMsg.textContent = 'Server error. Please try again.';
                statusMsg.classList.add('error');
            }
        };
    }
    function deleteRegion(id) {
        if (!confirm('Are you sure you want to delete this region?')) return;
        fetch(`http://localhost:3000/api/regions/${id}`, { method: 'DELETE' })
            .then(res => res.json())
            .then(result => {
                if (result.success) loadRegionsZonesCircuits();
                else alert(result.error || 'Failed to delete region.');
            })
            .catch(() => alert('Server error. Please try again.'));
    }
    function showEditZoneModal(zone) {
        let modal = document.getElementById('edit-zone-modal');
        if (modal) modal.remove();
        modal = document.createElement('div');
        modal.id = 'edit-zone-modal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-backdrop"></div>
            <div class="modal-content" tabindex="-1">
                <button class="close-btn" id="close-edit-zone-modal">&times;</button>
                <h2>Edit Zone</h2>
                <form id="edit-zone-form">
                    <div class="form-group">
                        <label for="edit-zone-name">Zone Name</label>
                        <input type="text" id="edit-zone-name" value="${zone.name}" required />
                    </div>
                    <div class="form-group">
                        <label for="edit-zone-region">Region</label>
                        <select id="edit-zone-region" required></select>
                    </div>
                    <button type="submit" class="submit-btn">Save Changes</button>
                    <div id="edit-zone-status-message" class="status-message"></div>
                </form>
            </div>
        `;
        document.querySelector('.superadmin-container').appendChild(modal);
        // Populate region dropdown
        fetch('http://localhost:3000/api/regions').then(r => r.json()).then(regions => {
            const regionSelect = modal.querySelector('#edit-zone-region');
            regionSelect.innerHTML = '<option value="">Select Region</option>' +
                regions.map(r => `<option value="${r.id}" ${r.id == zone.region_id ? 'selected' : ''}>${r.name}</option>`).join('');
        });
        document.getElementById('close-edit-zone-modal').onclick = () => modal.remove();
        modal.querySelector('.modal-backdrop').onclick = () => modal.remove();
        modal.querySelector('.modal-content').onclick = e => e.stopPropagation();
        document.getElementById('edit-zone-form').onsubmit = async function(e) {
            e.preventDefault();
            const name = document.getElementById('edit-zone-name').value.trim();
            const region_id = document.getElementById('edit-zone-region').value;
            const statusMsg = document.getElementById('edit-zone-status-message');
            statusMsg.textContent = '';
            statusMsg.className = 'status-message';
            try {
                const res = await fetch(`http://localhost:3000/api/zones/${zone.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, region_id })
                });
                const data = await res.json();
                if (res.ok) {
                    statusMsg.textContent = 'Zone updated successfully!';
                    statusMsg.classList.add('success');
                    setTimeout(() => {
                        modal.remove();
                        loadRegionsZonesCircuits();
                    }, 900);
                } else {
                    statusMsg.textContent = data.error || 'Failed to update zone.';
                    statusMsg.classList.add('error');
                }
            } catch (err) {
                statusMsg.textContent = 'Server error. Please try again.';
                statusMsg.classList.add('error');
            }
        };
    }
    function deleteZone(id) {
        if (!confirm('Are you sure you want to delete this zone?')) return;
        fetch(`http://localhost:3000/api/zones/${id}`, { method: 'DELETE' })
            .then(res => res.json())
            .then(result => {
                if (result.success) loadRegionsZonesCircuits();
                else alert(result.error || 'Failed to delete zone.');
            })
            .catch(() => alert('Server error. Please try again.'));
    }
    function showEditCircuitModal(circuit) {
        let modal = document.getElementById('edit-circuit-modal');
        if (modal) modal.remove();
        modal = document.createElement('div');
        modal.id = 'edit-circuit-modal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-backdrop"></div>
            <div class="modal-content" tabindex="-1">
                <button class="close-btn" id="close-edit-circuit-modal">&times;</button>
                <h2>Edit Circuit</h2>
                <form id="edit-circuit-form">
                    <div class="form-group">
                        <label for="edit-circuit-name">Circuit Name</label>
                        <input type="text" id="edit-circuit-name" value="${circuit.name}" required />
                    </div>
                    <div class="form-group">
                        <label for="edit-circuit-zone">Zone</label>
                        <select id="edit-circuit-zone" required></select>
                    </div>
                    <button type="submit" class="submit-btn">Save Changes</button>
                    <div id="edit-circuit-status-message" class="status-message"></div>
                </form>
            </div>
        `;
        document.querySelector('.superadmin-container').appendChild(modal);
        // Populate zone dropdown
        fetch('http://localhost:3000/api/zones').then(zones => zones.json()).then(zones => {
            const zoneSelect = modal.querySelector('#edit-circuit-zone');
            zoneSelect.innerHTML = '<option value="">Select Zone</option>' +
                zones.map(z => `<option value="${z.id}" ${z.id == circuit.zone_id ? 'selected' : ''}>${z.name}</option>`).join('');
        });
        document.getElementById('close-edit-circuit-modal').onclick = () => modal.remove();
        modal.querySelector('.modal-backdrop').onclick = () => modal.remove();
        modal.querySelector('.modal-content').onclick = e => e.stopPropagation();
        document.getElementById('edit-circuit-form').onsubmit = async function(e) {
            e.preventDefault();
            const name = document.getElementById('edit-circuit-name').value.trim();
            const zone_id = document.getElementById('edit-circuit-zone').value;
            const statusMsg = document.getElementById('edit-circuit-status-message');
            statusMsg.textContent = '';
            statusMsg.className = 'status-message';
            try {
                const res = await fetch(`http://localhost:3000/api/circuits/${circuit.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, zone_id })
                });
                const data = await res.json();
                if (res.ok) {
                    statusMsg.textContent = 'Circuit updated successfully!';
                    statusMsg.classList.add('success');
                    setTimeout(() => {
                        modal.remove();
                        loadRegionsZonesCircuits();
                    }, 900);
                } else {
                    statusMsg.textContent = data.error || 'Failed to update circuit.';
                    statusMsg.classList.add('error');
                }
            } catch (err) {
                statusMsg.textContent = 'Server error. Please try again.';
                statusMsg.classList.add('error');
            }
        };
    }
    function deleteCircuit(id) {
        if (!confirm('Are you sure you want to delete this circuit?')) return;
        fetch(`http://localhost:3000/api/circuits/${id}`, { method: 'DELETE' })
            .then(res => res.json())
            .then(result => {
                if (result.success) loadRegionsZonesCircuits();
                else alert(result.error || 'Failed to delete circuit.');
            })
            .catch(() => alert('Server error. Please try again.'));
    }

    function showAssignUserModal(user) {
        let modal = document.getElementById('assign-user-modal');
        if (modal) modal.remove();
        modal = document.createElement('div');
        modal.id = 'assign-user-modal';
        modal.innerHTML = `
            <div class="modal-backdrop" style="z-index:1000;"></div>
            <div class="modal-content" tabindex="-1" style="z-index:1001; pointer-events: auto;">
                <button class="close-btn" id="close-assign-modal">&times;</button>
                <h2>Assign Region/Zone/Circuit</h2>
                <form id="assign-user-form">
                    <div class="form-group">
                        <label for="assign-region">Region</label>
                        <select id="assign-region"><option value="">None</option></select>
                    </div>
                    <div class="form-group">
                        <label for="assign-zone">Zone</label>
                        <select id="assign-zone"><option value="">None</option></select>
                    </div>
                    <div class="form-group">
                        <label for="assign-circuit">Circuit</label>
                        <select id="assign-circuit"><option value="">None</option></select>
                    </div>
                    <button type="submit" class="submit-btn">Save Assignment</button>
                    <div id="assign-status-message" class="status-message"></div>
                </form>
                <div id="assign-fetch-error" style="color:#c62828; margin-top:16px; display:none;"></div>
            </div>
        `;
        document.querySelector('.superadmin-container').appendChild(modal);
        document.getElementById('close-assign-modal').onclick = () => modal.remove();
        modal.querySelector('.modal-backdrop').onclick = () => modal.remove();
        modal.querySelector('.modal-content').onclick = e => e.stopPropagation();
        // Fetch options with error handling
        Promise.all([
            fetch('http://localhost:3000/api/regions').then(r => r.json()),
            fetch('http://localhost:3000/api/zones').then(r => r.json()),
            fetch('http://localhost:3000/api/circuits').then(r => r.json())
        ]).then(([regions, zones, circuits]) => {
            const regionSelect = document.getElementById('assign-region');
            const zoneSelect = document.getElementById('assign-zone');
            const circuitSelect = document.getElementById('assign-circuit');
            // Helper to populate zones/circuits based on selection
            function populateZones(regionId) {
                zoneSelect.innerHTML = '<option value="">None</option>' +
                    zones.filter(z => String(z.region_id) === String(regionId)).map(z => `<option value="${z.id}">${z.name}</option>`).join('');
            }
            function populateCircuits(zoneId) {
                circuitSelect.innerHTML = '<option value="">None</option>' +
                    circuits.filter(c => String(c.zone_id) === String(zoneId)).map(c => `<option value="${c.id}">${c.name}</option>`).join('');
            }
            // Populate regions
            regionSelect.innerHTML = '<option value="">None</option>' + regions.map(r => `<option value="${r.id}"${user.region_id==r.id?' selected':''}>${r.name}</option>`).join('');
            // Populate zones and circuits based on current user assignment
            if (user.region_id) {
                populateZones(user.region_id);
            } else {
                zoneSelect.innerHTML = '<option value="">None</option>';
            }
            if (user.zone_id) {
                populateCircuits(user.zone_id);
            } else {
                circuitSelect.innerHTML = '<option value="">None</option>';
            }
            // When region changes, update zones and clear circuits
            regionSelect.onchange = function() {
                populateZones(this.value);
                circuitSelect.innerHTML = '<option value="">None</option>';
            };
            // When zone changes, update circuits
            zoneSelect.onchange = function() {
                populateCircuits(this.value);
            };
        }).catch(err => {
            console.error('Error fetching regions/zones/circuits:', err);
            const fetchError = document.getElementById('assign-fetch-error');
            fetchError.textContent = 'Failed to load regions, zones, or circuits. Please check your backend/API.';
            fetchError.style.display = 'block';
        });
        document.getElementById('assign-user-form').onsubmit = async function(e) {
            e.preventDefault();
            const region_id = document.getElementById('assign-region').value || null;
            const zone_id = document.getElementById('assign-zone').value || null;
            const circuit_id = document.getElementById('assign-circuit').value || null;
            const statusMsg = document.getElementById('assign-status-message');
            statusMsg.textContent = '';
            statusMsg.className = 'status-message';
            try {
                const res = await fetch(`http://localhost:3000/api/users/${user.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ region_id, zone_id, circuit_id })
                });
                const data = await res.json();
                if (res.ok) {
                    statusMsg.textContent = 'Assignment updated!';
                    statusMsg.classList.add('success');
                    setTimeout(() => {
                        modal.remove();
                        loadUsersTable();
                    }, 900);
                } else {
                    statusMsg.textContent = data.error || 'Failed to assign.';
                    statusMsg.classList.add('error');
                }
            } catch (err) {
                statusMsg.textContent = 'Server error. Please try again.';
                statusMsg.classList.add('error');
            }
        };
    }

    async function loadAccountStats() {
        const statsDiv = document.getElementById('account-stats');
        statsDiv.innerHTML = 'Loading account stats...';
        try {
            const res = await fetch('http://localhost:3000/api/account-stats');
            const stats = await res.json();
            statsDiv.innerHTML = `
                <div class="account-stats">
                    <div class="account-stats-card total"><div class="stat-label">Total Accounts</div><div class="stat-value">${stats.total}</div></div>
                    <div class="account-stats-card"><div class="stat-label">Circuits Accounts</div><div class="stat-value">${stats.circuit}</div></div>
                    <div class="account-stats-card"><div class="stat-label">Zonal Accounts</div><div class="stat-value">${stats.zonal}</div></div>
                    <div class="account-stats-card"><div class="stat-label">Regional Accounts</div><div class="stat-value">${stats.regional}</div></div>
                    <div class="account-stats-card"><div class="stat-label">National Accounts</div><div class="stat-value">${stats.national}</div></div>
                </div>
            `;
        } catch (err) {
            statsDiv.innerHTML = '<span style="color:#c62828">Failed to load account stats.</span>';
        }
    }

    // Load section based on URL hash, default to dashboard
    const initialSection = window.location.hash ? window.location.hash.substring(1) : 'dashboard';
    loadSection(initialSection);
});

function showAboutUserModal(user) {
    // Remove any existing modal
    let modal = document.getElementById('about-user-modal');
    if (modal) modal.remove();
    modal = document.createElement('div');
    modal.id = 'about-user-modal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-backdrop"></div>
        <div class="modal-content" tabindex="-1">
            <button class="close-btn" id="close-about-modal">&times;</button>
            <h2 style="color:#2563eb;margin-top:0;">User Details</h2>
            <div id="about-user-details">
                <div class="user-detail-row"><span class="user-detail-label">Name:</span><span class="user-detail-value">${user.name || ''}</span></div>
                <div class="user-detail-row"><span class="user-detail-label">Email:</span><span class="user-detail-value">${user.email || ''}</span></div>
                <div class="user-detail-row"><span class="user-detail-label">Date of Birth:</span><span class="user-detail-value">${user.dob || '-'}</span></div>
                <div class="user-detail-row"><span class="user-detail-label">Phone Number:</span><span class="user-detail-value">${user.phone_number || '-'}</span></div>
                <div class="user-detail-row"><span class="user-detail-label">Sex:</span><span class="user-detail-value">${user.sex || '-'}</span></div>
                <div class="user-detail-row"><span class="user-detail-label">AIMS Number:</span><span class="user-detail-value">${user.aims_number || '-'}</span></div>
                <div class="user-detail-row"><span class="user-detail-label">Role:</span><span class="user-detail-value">${user.role || ''}</span></div>
                <div class="user-detail-row"><span class="user-detail-label">Assigned:</span><span class="user-detail-value">${[user.circuit_name ? 'Circuit: '+user.circuit_name : '', user.zone_name ? 'Zone: '+user.zone_name : '', user.region_name ? 'Region: '+user.region_name : ''].filter(Boolean).join(', ') || '-'}</span></div>
            </div>
        </div>
    `;
    document.querySelector('.superadmin-container').appendChild(modal);
    document.getElementById('close-about-modal').onclick = () => modal.remove();
    modal.querySelector('.modal-backdrop').onclick = () => modal.remove();
} 