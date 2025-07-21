// House List
const houses = [
  "Martand", "Shankar", "Narasimha", "Siddharaj", "Muktabai", "Lakshmibai"
];

// Simulated "database"
let users = JSON.parse(localStorage.getItem("users") || "[]");
let votes = JSON.parse(localStorage.getItem("votes") || "{}"); // e.g. { house: [ratings...] }

// Utility
function saveData() {
  localStorage.setItem("users", JSON.stringify(users));
  localStorage.setItem("votes", JSON.stringify(votes));
}

// Popup Disappear
setTimeout(() => {
  document.getElementById("popupVoteReady").style.display = "none";
}, 4000);

// Update House Standings UI
function updateHouseStandings() {
  const container = document.getElementById("houseStandings");
  container.innerHTML = "";

  let houseScores = houses.map(house => {
    let ratings = votes[house] || [];
    let avg = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
    return {
      name: house,
      star: avg,
      count: ratings.length
    };
  });

  // Sort descending by star average
  houseScores.sort((a, b) => b.star - a.star);

  // Mark Winner
  let winner = houseScores[0];
  document.getElementById("currentWinner").innerText =
    winner.star > 0
      ? `🏆 Current Winner: ${winner.name} (${winner.star.toFixed(2)} Stars, ${winner.count} Votes)`
      : "No votes yet!";

  // Render
  houseScores.forEach(house => {
    let percent = house.star ? (house.star / 5 * 100).toFixed(2) : 0;
    let starDisplay = "★".repeat(Math.round(house.star)) + "☆".repeat(5 - Math.round(house.star));
    container.innerHTML += `
      <div class="col-12 col-md-4">
        <div class="card shadow text-center">
          <div class="card-header fs-5 fw-bold bg-primary text-white">${house.name}</div>
          <div class="card-body">
            <div style="font-size: 1.5rem; color: #ffc107">${starDisplay}</div>
            <p><b>${house.star.toFixed(2)} Stars</b> (${house.count} vote${house.count!=1?'s':''})</p>
            <div class="progress" style="height:16px">
              <div class="progress-bar" style="width:${percent}%; background:#0d6efd">${percent}%</div>
            </div>
          </div>
        </div>
      </div>
    `;
  });
}
updateHouseStandings();

// ===== Signup =====
document.getElementById("signupForm").onsubmit = function (e) {
  e.preventDefault();

  let name = document.getElementById("teacherName").value.trim();
  let desig = document.getElementById("designation").value.trim();
  let house = document.getElementById("teacherHouse").value;
  let contact = document.getElementById("contactNumber").value.trim();
  let username = document.getElementById("signupUsername").value.trim();
  let password = document.getElementById("signupPassword").value;

  if (users.find(u => u.username === username)) {
    alert("Username already exists. Please pick another.");
    return;
  }

  users.push({
    name, desig, house, contact, username, password
  });
  saveData();
  alert("Signup successful! You may now login.");
  this.reset();
};

// ===== Login =====
document.getElementById("loginForm").onsubmit = function (e) {
  e.preventDefault();
  let un = document.getElementById("loginUsername").value.trim();
  let pw = document.getElementById("loginPassword").value;
  let user = users.find(u => u.username === un && u.password === pw);

  if (!user) {
    alert("Invalid username or password.");
    return;
  }

  // Save session
  localStorage.setItem("loggedInUser", JSON.stringify(user));
  showVoteSection();
};

// Logout
document.getElementById("logoutBtn").onclick = function () {
  localStorage.removeItem("loggedInUser");
  showLoginSection();
};

function showVoteSection() {
  document.getElementById("voteSection").classList.remove("d-none");
  document.querySelectorAll("#loginForm, #signupForm").forEach(f => f.parentElement.parentElement.classList.add("d-none"));
  document.getElementById("logoutBtn").classList.remove("d-none");
  document.querySelectorAll("#voteHouseSelect")[0].value = "";
  document.getElementById("voteBtn").disabled = true;
  clearStars();
}

function showLoginSection() {
  document.getElementById("voteSection").classList.add("d-none");
  document.querySelectorAll("#loginForm, #signupForm").forEach(f => f.parentElement.parentElement.classList.remove("d-none"));
  document.getElementById("logoutBtn").classList.add("d-none");
  document.getElementById("voteMsg").innerText = "";
}

function checkLogin() {
  if (localStorage.getItem("loggedInUser")) {
    showVoteSection();
  } else {
    showLoginSection();
  }
}
checkLogin();

// ===== Star Voting =====
let selectedStars = 0;
const stars = document.querySelectorAll(".star-rating .star");

function clearStars() {
  selectedStars = 0;
  stars.forEach(s => s.classList.remove("selected"));
  document.getElementById("voteBtn").disabled = true;
}

stars.forEach(star => {
  star.addEventListener("mouseenter", function () {
    let val = Number(this.dataset.star);
    stars.forEach(s => s.classList.toggle("selected", Number(s.dataset.star) <= val));
  });
  star.addEventListener("mouseleave", function () {
    stars.forEach(s => s.classList.toggle("selected", Number(s.dataset.star) <= selectedStars));
  });
  star.addEventListener("click", function () {
    selectedStars = Number(this.dataset.star);
    stars.forEach(s => s.classList.toggle("selected", Number(s.dataset.star) <= selectedStars));
    // enable vote button if house selected
    if (document.getElementById("voteHouseSelect").value && selectedStars > 0) {
      document.getElementById("voteBtn").disabled = false;
    }
  });
});

document.getElementById("voteHouseSelect").onchange = function () {
  if (this.value && selectedStars > 0) {
    document.getElementById("voteBtn").disabled = false;
  } else {
    document.getElementById("voteBtn").disabled = true;
  }
};

// Submit Vote
document.getElementById("voteBtn").onclick = function () {
  let user = JSON.parse(localStorage.getItem("loggedInUser"));
  let house = document.getElementById("voteHouseSelect").value;
  let rating = selectedStars;

  if (!house || !rating) return;

  // One vote per user per house per "session"; for a real system, enforce appropriately.
  votes[house] = votes[house] || [];
  votes[house].push(rating);
  saveData();

  document.getElementById("voteMsg").innerText = `Thank you. You have submitted ${rating} star(s) for ${house}.`;
  clearStars();
  document.getElementById("voteHouseSelect").selectedIndex = 0;
  updateHouseStandings();
};

// Prevent accidental reload issues
window.onbeforeunload = () => null;
