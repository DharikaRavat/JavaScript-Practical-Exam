let productList = document.getElementById("product-list");
let addProductBtn = document.getElementById("add-product");
let sortLowToHigh = document.getElementById("sort-low-to-high");
let sortHighToLow = document.getElementById("sort-high-to-low");
let categoryFilter = document.getElementById("category-filter");

// Input Fields
let titleInput = document.getElementById("title");
let categoryInput = document.getElementById("category");
let priceInput = document.getElementById("price");
let imageInput = document.getElementById("image");

let products = [];
let isEditMode = false;
let editId = null;

// Fetch data
function fetchData() {
  fetch("http://localhost:3000/products")
    .then(res => res.json())
    .then(data => {
      products = data;
      renderProducts(products);
      populateCategories(products);
    });
}
fetchData();

function renderProducts(data) {
  productList.innerHTML = data.map(p => createCard(p)).join("");
}

function createCard({ id, image, title, category, price }) {
  return `
    <div class="product-card" data-id="${id}">
      <img src="${image || 'https://via.placeholder.com/150'}" />
      <h3>${title}</h3>
      <p>${category}</p>
      <p>₹ ${price}</p>
      <button class="edit-btn" data-id="${id}">Edit</button>
      <button class="price-edit-btn" data-id="${id}">Edit Price</button>
      <button class="delete-btn" data-id="${id}">Delete</button>
    </div>
  `;
}

// Add or update product
addProductBtn.addEventListener("click", () => {
  let title = titleInput.value.trim();
  let category = categoryInput.value.trim();
  let price = parseFloat(priceInput.value.trim());
  let image = imageInput.value.trim();

  if (!title || !category || isNaN(price)) {
    alert("Please fill all fields.");
    return;
  }

  let product = {
    title,
    category,
    price,
    image: image || "https://via.placeholder.com/150"
  };

  if (isEditMode) {
    fetch(`http://localhost:3000/products/${editId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product)
    }).then(res => res.json()).then(() => {
      alert("Product updated!");
      resetForm();
      fetchData();
    });
  } else {
    fetch("http://localhost:3000/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product)
    }).then(res => res.json()).then(() => {
      alert("Product added!");
      resetForm();
      fetchData();
    });
  }
});

function resetForm() {
  titleInput.value = "";
  categoryInput.value = "";
  priceInput.value = "";
  imageInput.value = "";
  isEditMode = false;
  editId = null;
  addProductBtn.innerText = "Add Product";
}

// Edit, Delete, Edit Price
productList.addEventListener("click", e => {
  let id = e.target.dataset.id;

  // DELETE
  if (e.target.classList.contains("delete-btn")) {
    fetch(`http://localhost:3000/products/${id}`, {
      method: "DELETE"
    }).then(res => res.json()).then(() => {
      alert("Product deleted.");
      fetchData();
    });
  }

  // EDIT
  if (e.target.classList.contains("edit-btn")) {
    fetch(`http://localhost:3000/products/${id}`)
      .then(res => res.json())
      .then(data => {
        titleInput.value = data.title;
        categoryInput.value = data.category;
        priceInput.value = data.price;
        imageInput.value = data.image;
        isEditMode = true;
        editId = id;
        addProductBtn.innerText = "Update Product";
      });
  }

  // EDIT PRICE ONLY
  if (e.target.classList.contains("price-edit-btn")) {
    let newPrice = prompt("Enter new price:");
    if (newPrice === null) return;
    newPrice = parseFloat(newPrice);
    if (isNaN(newPrice)) {
      alert("Invalid price.");
      return;
    }

    fetch(`http://localhost:3000/products/${id}`)
      .then(res => res.json())
      .then(product => {
        product.price = newPrice;

        return fetch(`http://localhost:3000/products/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(product)
        });
      })
      .then(res => res.json())
      .then(() => {
        alert("Price updated!");
        fetchData();
      });
  }
});

// Sort
sortLowToHigh.addEventListener("click", () => {
  let sorted = [...products].sort((a, b) => a.price - b.price);
  renderProducts(sorted);
});

sortHighToLow.addEventListener("click", () => {
  let sorted = [...products].sort((a, b) => b.price - a.price);
  renderProducts(sorted);
});

// Category filter
categoryFilter.addEventListener("change", () => {
  let value = categoryFilter.value;
  if (value === "All Categories") {
    renderProducts(products);
  } else {
    let filtered = products.filter(p => p.category === value);
    renderProducts(filtered);
  }
});

// Categories
function populateCategories(data) {
  let categories = ["All Categories"];
  data.forEach(p => {
    if (!categories.includes(p.category)) {
      categories.push(p.category);
    }
  });

  categoryFilter.innerHTML = categories
    .map(cat => `<option value="${cat}">${cat}</option>`)
    .join("");
}
