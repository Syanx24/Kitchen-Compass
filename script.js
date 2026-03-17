const searchInput = document.getElementById("search-input");
const overlay = document.getElementById("placeholder-overlay");
const searchBtn = document.getElementById("search-btn");
const mealsContainer = document.getElementById("meals-container");
const resultHeading = document.getElementById("result-heading");
const errorContainer = document.getElementById("error-container");
const mealDetails = document.getElementById("meal-details");

const placeholders = [
  "What are you craving?",
  "Search by keywords",
  // "Try 'Chicken'... in this way",
];
let currentIndex = 0;

function rotatePlaceholder() {
  if (searchInput.value.length > 0) return;

  overlay.classList.add("exit-up");
  setTimeout(() => {
    currentIndex = (currentIndex + 1) % placeholders.length;
    overlay.innerText = placeholders[currentIndex];
    overlay.classList.remove("exit-up");
  }, 400);
}

setInterval(rotatePlaceholder, 3000);

searchInput.addEventListener("input", () => {
  overlay.classList.toggle("force-hidden", searchInput.value.length > 0);
});

// API Calls
async function searchMeals() {
  const term = searchInput.value.trim();
  if (!term) {
    showError("Please enter a search term");
    return;
  }

  try {
    resultHeading.innerHTML = `<h2>Searching for...</h2>`;
    const res = await fetch(
      `https://www.themealdb.com/api/json/v1/1/search.php?s=${term}`,
    );
    const data = await res.json();

    if (!data.meals) {
      showError(`No results found for "${term}".`);
      mealsContainer.innerHTML = "";
      resultHeading.innerHTML = "";
    } else {
      errorContainer.style.display = "none";
      resultHeading.innerHTML = `<h2>Search results for '${term}':</h2>`;
      displayMeals(data.meals);
    }
  } catch (err) {
    showError("Connection error. Please try again.");
  }
}

function displayMeals(meals) {
  mealsContainer.innerHTML = meals
    .map(
      (meal) => `
        <div class="meal" onclick="getMealById('${meal.idMeal}')">
            <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
            <div class="meal-info">
                <span class="meal-category">${meal.strCategory}</span>
                <h3 class="meal-title">${meal.strMeal}</h3>
            </div>
        </div>
    `,
    )
    .join("");
}

async function getMealById(id) {
  const res = await fetch(
    `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`,
  );
  const data = await res.json();
  renderMealDetail(data.meals[0]);
}

function renderMealDetail(meal) {
  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    if (meal[`strIngredient${i}`]) {
      ingredients.push(
        `${meal[`strMeasure${i}`]} ${meal[`strIngredient${i}`]}`,
      );
    }
  }

  toggleView(true);
  mealDetails.innerHTML = `
        <div class="details-view-content">
            <button class="back-btn" onclick="toggleView(false)"><i class="fas fa-arrow-left"></i> Back</button>
            <h1>${meal.strMeal}</h1>
            <img src="${meal.strMealThumb}" class="meal-details-img">
            <div class="instructions">
                <h3>Instructions</h3>
                <p>${meal.strInstructions.replace(/\n/g, "<br>")}</p>
            </div>
            <ul class="ingredients-list" style="margin: 1.5rem 0; list-style: none;">
                ${ingredients.map((ing) => `<li><i class="fas fa-check" style="color:var(--secondary)"></i> ${ing}</li>`).join("")}
            </ul>
            ${meal.strYoutube ? `<a href="${meal.strYoutube}" target="_blank" class="back-btn" style="background:#ff0000; color:white; text-decoration:none;">Watch on YouTube</a>` : ""}
        </div>
    `;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function toggleView(showDetail) {
  mealDetails.style.display = showDetail ? "block" : "none";
  document.querySelector(".search-section").style.display = showDetail
    ? "none"
    : "block";
  mealsContainer.style.display = showDetail ? "none" : "grid";
  resultHeading.style.display = showDetail ? "none" : "block";
}

function showError(msg) {
  errorContainer.textContent = msg;
  errorContainer.style.display = "block";
}

searchBtn.addEventListener("click", searchMeals);
searchInput.addEventListener(
  "keypress",
  (e) => e.key === "Enter" && searchMeals(),
);
