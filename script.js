// JavaScript for handling ingredient popups
const ingredientsData = {
  'cheeseburger': 'Have a Have a look onme pound fish',
  'coke': 'Carbonated water, Sugar, Caffeine, Phosphoric acid, Caramel color, Natural flavors',
  'chocolate-donut': 'Flour, Cocoa powder, Sugar, Butter, Eggs, Milk, Baking powder, Vanilla extract'
};

function showIngredients(item) {
  const ingredientsPopup = document.getElementById('ingredients-popup');
  const popupTitle = document.getElementById('popup-title');
  const popupIngredients = document.getElementById('popup-ingredients');

  popupTitle.innerText = `${item.charAt(0).toUpperCase() + item.slice(1)} Ingredients`;
  popupIngredients.innerText = ingredientsData[item];

  ingredientsPopup.style.display = 'block';
}

function closePopup() {
  const ingredientsPopup = document.getElementById('ingredients-popup');
  ingredientsPopup.style.display = 'none';
}