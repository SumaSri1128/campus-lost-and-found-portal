
const API_URL = "https://campus-lost-and-found-portal-1-4bzy.onrender.com/api";

// STUDENT REGISTRATION
const registerForm = document.getElementById("registerForm");

if (registerForm) {
    registerForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const name = document.getElementById("name").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        const message = document.getElementById("registerMessage");

        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name,
                    email,
                    password
                })
            });

            const data = await response.json();

            if (response.ok) {
                message.style.color = "green";
                message.textContent = "Registration successful! Please login.";

                registerForm.reset();
            } else {
                message.style.color = "red";
                message.textContent = data.message || "Registration failed.";
            }

        } catch (error) {
            message.style.color = "red";
            message.textContent = "Unable to connect to server.";
            console.error(error);
        }
    });
}

// STUDENT LOGIN
const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const message = document.getElementById("loginMessage");

        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email,
                    password
                })
            });

            const data = await response.json();

            if (response.ok) {
                // Save the login token and user details
                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify(data.user));

                message.style.color = "green";
                message.textContent = "Login successful!";

                // Go to the student dashboard
                window.location.href = "dashboard.html";
            } else {
                message.style.color = "red";
                message.textContent = data.message || "Invalid email or password.";
            }

        } catch (error) {
            message.style.color = "red";
            message.textContent = "Unable to connect to server.";
            console.error("Login error:", error);
        }
    });
}

// DISPLAY LOGGED-IN USER ON DASHBOARD

// STUDENT DASHBOARD
const welcomeMessage = document.getElementById("welcomeMessage");
const userRole = document.getElementById("userRole");
const adminSection = document.getElementById("adminSection");

if (welcomeMessage) {
    const savedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!savedUser || !token) {
        window.location.href = "login.html";
    } else {
        const user = JSON.parse(savedUser);

        welcomeMessage.textContent = `Welcome, ${user.name}!`;
        userRole.textContent = `Account type: ${user.role}`;

        if (user.role === "admin" && adminSection) {
            adminSection.hidden = false;
        }

        loadRecentItems();
    }
}


// LOAD RECENT ITEMS FROM BACKEND
async function loadRecentItems() {
    const recentItems = document.getElementById("recentItems");

    if (!recentItems) return;

    try {
        const response = await fetch(`${API_URL}/items`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Unable to load items");
        }

        const items = data.items || data;

        if (!Array.isArray(items) || items.length === 0) {
            recentItems.innerHTML = "<p>No items reported yet.</p>";
            return;
        }

        recentItems.innerHTML = "";

        items.slice(0, 4).forEach(item => {
            const card = document.createElement("div");

            card.className = "recent-item-card";

            const title = document.createElement("h3");
            title.textContent = item.title;

            const type = document.createElement("p");
            type.textContent = `Type: ${item.type}`;

            const location = document.createElement("p");
            location.textContent = `Location: ${item.location}`;

            const status = document.createElement("p");
            status.textContent = `Status: ${item.status}`;

            card.append(title, type, location, status);
            recentItems.appendChild(card);
        });

    } catch (error) {
        recentItems.textContent = "Unable to load recent items.";
        console.error("Dashboard error:", error);
    }
}


// LOGOUT
const logoutButton = document.getElementById("logoutButton");

if (logoutButton) {
    logoutButton.addEventListener("click", function () {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        window.location.href = "login.html";
    });
}

// REPORT LOST OR FOUND ITEM

const reportForm = document.getElementById("reportForm");

if (reportForm) {

    const typeField = document.getElementById("type");
    const reportHeading = document.getElementById("reportHeading");

    // Read report type from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const selectedType = urlParams.get("type");

    if (selectedType === "lost" || selectedType === "found") {
        typeField.value = selectedType;

        reportHeading.textContent =
            selectedType === "lost"
                ? "Report a Lost Item"
                : "Report a Found Item";
    }

    reportForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const token = localStorage.getItem("token");
        const message = document.getElementById("reportMessage");

        if (!token) {
            alert("Please login before reporting an item.");
            window.location.href = "login.html";
            return;
        }

        const itemData = {
            title: document.getElementById("title").value.trim(),
            description: document.getElementById("description").value.trim(),
            category: document.getElementById("category").value,
            type: typeField.value,
            location: document.getElementById("location").value.trim(),
            date: document.getElementById("date").value,
            imageUrl: document.getElementById("imageUrl").value.trim()
        };

        try {

            const response = await fetch(`${API_URL}/items`, {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },

                body: JSON.stringify(itemData)
            });

            const data = await response.json();

            if (response.ok) {

                message.style.color = "green";
                message.textContent =
                    "Item reported successfully!";

                reportForm.reset();

                typeField.value = "";
                reportHeading.textContent = "Report an Item";

            } else {

                message.style.color = "red";
                message.textContent =
                    data.message || "Unable to report item.";

            }

        } catch (error) {

            message.style.color = "red";
            message.textContent =
                "Unable to connect to the backend server.";

            console.error("Report item error:", error);

        }

    });
}

// Browse All Items Page

const itemsList = document.getElementById("itemsList");

if (itemsList) {
    const searchInput = document.getElementById("searchInput");
    const typeFilter = document.getElementById("typeFilter");
    const categoryFilter = document.getElementById("categoryFilter");
    const statusFilter = document.getElementById("statusFilter");
    const searchButton = document.getElementById("searchButton");
    const clearButton = document.getElementById("clearButton");
    const itemsMessage = document.getElementById("itemsMessage");

    async function loadItems() {
        itemsMessage.textContent = "Loading items...";
        itemsList.innerHTML = "";

        const params = new URLSearchParams();

        if (searchInput.value.trim()) {
            params.append("search", searchInput.value.trim());
        }

        if (typeFilter.value) {
            params.append("type", typeFilter.value);
        }

        if (categoryFilter.value) {
            params.append("category", categoryFilter.value);
        }

        if (statusFilter.value) {
            params.append("status", statusFilter.value);
        }

        try {
            const response = await fetch(
                `${API_URL}/items?${params.toString()}`
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Unable to load items.");
            }

            const items = data.items || data;

            if (!Array.isArray(items) || items.length === 0) {
                itemsMessage.textContent = "No items found.";
                return;
            }

            itemsMessage.textContent = `Found ${items.length} item(s).`;

            items.forEach(item => {
                const card = document.createElement("div");
                card.className = "item-card";

                const title = document.createElement("h3");
                title.textContent = item.title;

                const description = document.createElement("p");
                description.textContent = item.description;

                const type = document.createElement("p");
                type.textContent = `Type: ${item.type}`;

                const category = document.createElement("p");
                category.textContent = `Category: ${item.category}`;

                const location = document.createElement("p");
                location.textContent = `Location: ${item.location}`;

                const date = document.createElement("p");
                date.textContent = `Date: ${
                    item.date ? new Date(item.date).toLocaleDateString() : "Not provided"
                }`;

                const status = document.createElement("span");
                status.className = "item-badge";
                status.textContent = `Status: ${item.status}`;

                card.append(
    title,
    description,
    type,
    category,
    location,
    date,
    status
);

card.style.cursor = "pointer";

card.addEventListener("click", function () {
    window.location.href =
        `item-details.html?id=${encodeURIComponent(item._id)}`;
});

itemsList.appendChild(card);
            });

        } catch (error) {
            itemsMessage.textContent = "Unable to load items. Please try again.";
            console.error("Load items error:", error);
        }
    }

    searchButton.addEventListener("click", loadItems);

    clearButton.addEventListener("click", function () {
        searchInput.value = "";
        typeFilter.value = "";
        categoryFilter.value = "";
        statusFilter.value = "";
        loadItems();
    });

    searchInput.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            loadItems();
        }
    });

    loadItems();
}

// Item Details and Claim Functionality

const itemDetailsContainer = document.getElementById("itemDetails");

if (itemDetailsContainer) {
    const claimSection = document.getElementById("claimSection");
    const claimForm = document.getElementById("claimForm");
    const claimMessageResult = document.getElementById("claimMessageResult");

    const params = new URLSearchParams(window.location.search);
    const itemId = params.get("id");

    let currentItem = null;

    async function loadItemDetails() {
        if (!itemId) {
            itemDetailsContainer.textContent = "Item ID is missing.";
            return;
        }

        try {
            const response = await fetch(`${API_URL}/items/${itemId}`);
            const item = await response.json();

            if (!response.ok) {
                throw new Error(item.message || "Unable to load item.");
            }

            currentItem = item;

            const card = document.createElement("div");
            card.className = "details-card";

            function addDetail(label, value) {
                const paragraph = document.createElement("p");
                paragraph.textContent = `${label}: ${value || "Not provided"}`;
                card.appendChild(paragraph);
            }

            const title = document.createElement("h1");
            title.textContent = item.title;
            card.appendChild(title);

            addDetail("Description", item.description);
            addDetail("Type", item.type);
            addDetail("Category", item.category);
            addDetail("Location", item.location);
            addDetail(
                "Date",
                item.date ? new Date(item.date).toLocaleDateString() : ""
            );
            addDetail("Status", item.status);
            addDetail(
                "Reported By",
                item.reportedBy ? item.reportedBy.name : "Unknown"
            );

            if (item.imageUrl) {
                const image = document.createElement("img");
                image.src = item.imageUrl;
                image.alt = item.title;
                image.className = "details-image";
                card.appendChild(image);
            }

            itemDetailsContainer.innerHTML = "";
            itemDetailsContainer.appendChild(card);

            const savedUser = localStorage.getItem("user");
            const token = localStorage.getItem("token");

            if (!savedUser || !token) {
                claimSection.hidden = true;
                return;
            }

            const user = JSON.parse(savedUser);
            const reporterId = item.reportedBy
                ? item.reportedBy._id
                : null;

            const isOwnItem =
                reporterId && String(reporterId) === String(user._id);

            if (
                item.type === "found" &&
                item.status === "open" &&
                !isOwnItem
            ) {
                claimSection.hidden = false;
            } else {
                claimSection.hidden = true;
            }

        } catch (error) {
            itemDetailsContainer.textContent =
                error.message || "Unable to load item details.";
            console.error("Item details error:", error);
        }
    }

    if (claimForm) {
        claimForm.addEventListener("submit", async function (event) {
            event.preventDefault();

            const token = localStorage.getItem("token");
            const message = document
                .getElementById("claimMessage")
                .value.trim();

            if (!token) {
                alert("Please login before submitting a claim.");
                window.location.href = "login.html";
                return;
            }

            if (!message) {
                claimMessageResult.style.color = "red";
                claimMessageResult.textContent =
                    "Please enter a claim message.";
                return;
            }

            try {
                const response = await fetch(`${API_URL}/claims`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        itemId: currentItem._id,
                        message: message
                    })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || "Claim submission failed.");
                }

                claimMessageResult.style.color = "green";
                claimMessageResult.textContent =
                    "Your claim was submitted successfully!";

                claimForm.reset();

            } catch (error) {
                claimMessageResult.style.color = "red";
                claimMessageResult.textContent = error.message;
                console.error("Claim error:", error);
            }
        });
    }

    loadItemDetails();
}

// My Claims Page

const claimsList = document.getElementById("claimsList");

if (claimsList) {
    const claimsMessage = document.getElementById("claimsMessage");

    async function loadMyClaims() {
        const token = localStorage.getItem("token");

        if (!token) {
            window.location.href = "login.html";
            return;
        }

        claimsMessage.textContent = "Loading your claims...";

        try {
            const response = await fetch(`${API_URL}/claims`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Unable to load claims.");
            }

            const claims = Array.isArray(data)
                ? data
                : (data.claims || []);

            claimsList.innerHTML = "";

            if (claims.length === 0) {
                claimsMessage.textContent = "You have not submitted any claims yet.";
                return;
            }

            claimsMessage.textContent =
                `You have submitted ${claims.length} claim(s).`;

            claims.forEach(claim => {
                const card = document.createElement("div");
                card.className = "claim-item-card";

                const heading = document.createElement("h3");
                heading.textContent =
                    claim.item?.title || "Item details unavailable";

                const message = document.createElement("p");
                message.textContent =
                    `Your message: ${claim.message || "Not provided"}`;

                const statusText = document.createElement("p");
                statusText.textContent = "Claim status: ";

                const status = document.createElement("span");
                status.className =
                    `claim-status ${claim.status || "pending"}`;
                status.textContent = claim.status || "pending";

                statusText.appendChild(status);

                const date = document.createElement("p");
                date.textContent = claim.createdAt
                    ? `Submitted on: ${new Date(claim.createdAt).toLocaleDateString()}`
                    : "Submission date unavailable";

                card.append(heading, message, statusText, date);

                if (claim.item && claim.item._id) {
                    const link = document.createElement("a");
                    link.className = "claim-details-link";
                    link.textContent = "View Item Details";
                    link.href =
                        `item-details.html?id=${encodeURIComponent(claim.item._id)}`;

                    card.appendChild(link);
                }

                claimsList.appendChild(card);
            });

        } catch (error) {
            claimsMessage.textContent =
                "Unable to load your claims. Please try again.";
            console.error("My Claims error:", error);
        }
    }

    loadMyClaims();
}

// Admin Dashboard Functionality

const adminItemsList = document.getElementById("adminItemsList");

if (adminItemsList) {

    const adminClaimsList = document.getElementById("adminClaimsList");

    const adminItemsMessage =
        document.getElementById("adminItemsMessage");

    const adminClaimsMessage =
        document.getElementById("adminClaimsMessage");

    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (!token || !savedUser) {
        window.location.href = "login.html";
    } else {
        const user = JSON.parse(savedUser);

        if (user.role !== "admin") {
            alert("Access denied. Admin only.");
            window.location.href = "dashboard.html";
        } else {
            loadAdminData();
        }
    }

    async function loadAdminData() {
        await loadAdminItems();
        await loadAdminClaims();
    }

    async function loadAdminItems() {
        try {
            const response = await fetch(`${API_URL}/items`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Unable to load items.");
            }

            const items = data.items || data;

            document.getElementById("totalItems").textContent =
                Array.isArray(items) ? items.length : 0;

            adminItemsList.innerHTML = "";

            if (!Array.isArray(items) || items.length === 0) {
                adminItemsMessage.textContent = "No reported items found.";
                return;
            }

            adminItemsMessage.textContent = "";

            items.forEach(item => {
                const card = document.createElement("div");
                card.className = "admin-item-card";

                const title = document.createElement("h3");
                title.textContent = item.title;

                const type = document.createElement("p");
                type.textContent = `Type: ${item.type}`;

                const category = document.createElement("p");
                category.textContent = `Category: ${item.category}`;

                const location = document.createElement("p");
                location.textContent = `Location: ${item.location}`;

                const status = document.createElement("p");
                status.textContent = `Status: ${item.status}`;

                card.append(title, type, category, location, status);
                adminItemsList.appendChild(card);
            });

        } catch (error) {
            adminItemsMessage.textContent =
                "Unable to load reported items.";
            console.error("Admin items error:", error);
        }
    }

    async function loadAdminClaims() {
        try {
            const response = await fetch(`${API_URL}/claims`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Unable to load claims.");
            }

            const claims = Array.isArray(data)
                ? data
                : (data.claims || []);

            document.getElementById("totalClaims").textContent =
                claims.length;

            const pendingCount = claims.filter(
                claim => claim.status === "pending"
            ).length;

            document.getElementById("pendingClaims").textContent =
                pendingCount;

            adminClaimsList.innerHTML = "";

            if (claims.length === 0) {
                adminClaimsMessage.textContent = "No claims submitted yet.";
                return;
            }

            adminClaimsMessage.textContent = "";

            claims.forEach(claim => {
                const card = document.createElement("div");
                card.className = "admin-claim-card";

                const title = document.createElement("h3");
                title.textContent =
                    claim.item?.title || "Item details unavailable";

                const student = document.createElement("p");
                student.textContent =
                    `Claimed by: ${claim.claimedBy?.name || "Unknown student"}`;

                const message = document.createElement("p");
                message.textContent =
                    `Message: ${claim.message || "Not provided"}`;

                const status = document.createElement("p");
                status.textContent = `Status: ${claim.status}`;

                card.append(title, student, message, status);

                if (claim.status === "pending") {
                    const actions = document.createElement("div");
                    actions.className = "admin-actions";

                    const approveButton = document.createElement("button");
                    approveButton.className = "approve-button";
                    approveButton.textContent = "Approve";

                    const rejectButton = document.createElement("button");
                    rejectButton.className = "reject-button";
                    rejectButton.textContent = "Reject";

                    approveButton.addEventListener("click", () => {
                        updateClaimStatus(claim._id, "approved");
                    });

                    rejectButton.addEventListener("click", () => {
                        updateClaimStatus(claim._id, "rejected");
                    });

                    actions.append(approveButton, rejectButton);
                    card.appendChild(actions);
                }

                adminClaimsList.appendChild(card);
            });

        } catch (error) {
            adminClaimsMessage.textContent =
                "Unable to load student claims.";
            console.error("Admin claims error:", error);
        }
    }

    async function updateClaimStatus(claimId, status) {
        const confirmed = confirm(
            `Are you sure you want to ${status} this claim?`
        );

        if (!confirmed) return;

        try {
            const response = await fetch(
                `${API_URL}/claims/${claimId}/status`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({ status })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Unable to update claim.");
            }

            alert(`Claim ${status} successfully!`);

            await loadAdminData();

        } catch (error) {
            alert(error.message);
            console.error("Claim update error:", error);
        }
    }
}
