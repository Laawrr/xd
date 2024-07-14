let currentTitle = null;

//load titles and item list from localstorage
document.addEventListener('DOMContentLoaded', function () {
    loadTitlesFromStorage();
    loadListFromStorage();
})

//To open the sidebar
function toggleSidebar() {
    var $sidebar = $(".sidebar");
    var $container = $(".container");
    var $burger = $('.burger');

    if ($(window).width() <= 1290) {
        $sidebar.toggleClass("active");
        $container.toggleClass("sidebar-active");
        $burger.css("display", "none");
    }
}

//To close the sidebar
function closeSidebar() {
    var $sidebar = $(".sidebar");
    var $container = $(".container");
    var $burger = $('.burger');

    if ($(window).width() <= 1290) {
        $sidebar.removeClass("active");
        $container.removeClass("sidebar-active");
        $burger.css("display", "block");
    }
}

//Handle the "Enter" key press to add a title or item
document.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        const activeElementId = document.activeElement.id;
        if (activeElementId === "listTitle") {
            const listTitleInput = document.getElementById("listTitle");
            if (listTitleInput.value.trim() !== "") {
                event.preventDefault();
                addListTitle();
            }
        } else {
            const itemNameInput = document.getElementById("itemName");
            const itemQuantityInput = document.getElementById("itemQuantity");
            const itemUnitInput = document.getElementById("itemUnit");

            if (
                itemNameInput.value.trim() !== "" &&
                itemQuantityInput.value.trim() !== "" &&
                itemUnitInput.value.trim() !== ""
            ) {
                event.preventDefault();
                addItem();
            } else {
                itemNameInput.focus();
            }
        }
    }
});

//To save the input list from the user to local storage
function saveListToStorage() {
    if (!currentTitle) return;

    const $shoppingList = $("#itemList");
    const $items = $shoppingList.find("li");
    const savedItems = $items.map((_, item) => {
        const $item = $(item);
        const $label = $item.find("label");
        const $checkbox = $item.find('input[type="checkbox"]');
        const isChecked = $checkbox.is(":checked");
        const match = $label.text().match(/^(.*?) \((\d+) (\w+)\)$/);

        if (match) {
            const itemName = match[1];
            const itemQuantity = match[2];
            const itemUnit = match[3];
            return { itemName, itemQuantity, itemUnit, isChecked };
        } else {
            console.error("Error parsing item: ", $label.text());
            return { itemName: "Unknown", itemQuantity: 0, itemUnit: "units", isChecked: false };
        }
    }).get().filter(item => item !== null);

    let allLists = JSON.parse(localStorage.getItem("allLists")) || {};
    allLists[currentTitle] = savedItems;
    localStorage.setItem("allLists", JSON.stringify(allLists));
}

//To create a list of items inputted by the user
function createListItem(item) {
    const $newItem = $('<li></li>');
    const $checkbox = $('<input>', {
        type: 'checkbox',
        checked: item.isChecked,
        class: 'checkBox'
    });
    const $label = $('<label></label>', {
        text: `${item.itemName} (${item.itemQuantity} ${item.itemUnit})`,
        class: 'labels'
    });
    const $editBtn = $('<button></button>', {
        class: 'edit-btn',
        title: 'Edit item'
    }).append($('<img>', {
        src: 'img/editLogo.png',
        alt: 'Edit'
    }));
    const $removeBtn = $('<button></button>', {
        class: 'remove-btn',
        title: 'Delete Item'
    }).append($('<img>', {
        src: 'img/deleteLogo.png',
        alt: 'Remove'
    }));
    $newItem.append($checkbox, $label, $editBtn, $removeBtn);
    $label.toggleClass('completed', item.isChecked);
    $checkbox.on('change', function () {
        $label.toggleClass('completed', $(this).is(':checked'));
        saveListToStorage();
        
        if ($(this).is(':checked')) {
            console.log(`Item marked as complete: ${item.itemName}`);
        } else {
            console.log(`Item marked as incomplete: ${item.itemName}`);
        }
    });
    $editBtn.on('click', function () {
        const $listItem = $(this).closest('li');
        $listItem.toggleClass('active-item');
        editItem($label, $editBtn, $newItem, $removeBtn);
    });
    $removeBtn.on('click', function () {
        $newItem.remove();
        saveListToStorage();
        console.log(`Item removed: ${item.itemName}`);
    });
    
    return $newItem;
}

//To edit an item from item list
function editItem(label, editBtn, newItem, removeBtn) {
    const labelText = label.textContent;

    const match = labelText.match(/^(.*?) \((\d+) (\w+)\)$/);

    const itemName = match[1];
    const itemQuantity = match[2];
    const itemUnit = match[3];

    const inputName = document.createElement("input");
    inputName.type = "text";
    inputName.className = "edit-name";
    inputName.value = itemName;

    const inputQuantity = document.createElement("input");
    inputQuantity.type = "number";
    inputQuantity.className = "edit-quantity";
    inputQuantity.value = itemQuantity;
    inputQuantity.min = 1;

    const inputUnit = document.createElement("select");
    inputUnit.className = "edit-unit";
    ["pc", "kg", "lbs"].forEach(unit => {
        const option = document.createElement("option");
        option.value = unit;
        option.text = unit;
        if (unit === itemUnit) {
            option.selected = true;
        }
        inputUnit.appendChild(option);
    });

    const saveBtn = document.createElement("button");
    const saveImg = document.createElement("img");
    saveImg.src = "img/saveItem.png";
    saveImg.alt = "Save";
    saveBtn.appendChild(saveImg);
    saveBtn.className = "save-btn";
    saveBtn.title = "Save Edit";

    const discardBtn = document.createElement("button");
    const discardImg = document.createElement("img");
    discardImg.src = "img/deleteLogo.png";
    discardImg.alt = "Discard";
    discardBtn.appendChild(discardImg);
    discardBtn.className = "discard-btn";

    newItem.replaceChild(inputName, label);
    newItem.replaceChild(inputQuantity, editBtn);
    newItem.replaceChild(inputUnit, removeBtn);

    newItem.appendChild(saveBtn);
    newItem.appendChild(discardBtn);

    saveBtn.addEventListener("click", function () {
        const newName = inputName.value.trim();
        const newQuantity = inputQuantity.value.trim();
        const newUnit = inputUnit.options[inputUnit.selectedIndex].value;

        if (newName !== "" && newQuantity !== "") {
            label.textContent = `${newName} (${newQuantity} ${newUnit})`;
            label.className = "labels";

            newItem.replaceChild(label, inputName);
            newItem.removeChild(inputQuantity);
            newItem.removeChild(inputUnit);
            newItem.replaceChild(editBtn, saveBtn);
            newItem.appendChild(removeBtn);
            newItem.removeChild(discardBtn); 

            const checkbox = newItem.querySelector('input[type="checkbox"]');
            label.classList.toggle("completed", checkbox.checked);

            newItem.classList.remove('active-item');

            console.log(`Item edited: \n ${itemName} - ${newName} \n ${itemQuantity} - ${newQuantity} \n ${itemUnit} - ${newUnit}`);

            saveListToStorage();
        } else {
            alert("Please enter both item name and quantity.");
        }
    });

    discardBtn.addEventListener("click", function () {
        newItem.replaceChild(label, inputName);
        newItem.removeChild(inputQuantity);
        newItem.removeChild(inputUnit);
        newItem.replaceChild(editBtn, saveBtn);
        newItem.appendChild(removeBtn);
        newItem.removeChild(discardBtn);

        newItem.classList.remove('active-item');
    });

    inputName.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            saveBtn.click();
        }
    });

    inputQuantity.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            saveBtn.click();
        }
    });

    inputUnit.addEventListener("change", function () {
        const newUnit = inputUnit.options[inputUnit.selectedIndex].value;
        console.log(`Unit changed to: ${newUnit}`);
    });
}

//To load the list from the local storage
function loadListFromStorage() {
    const shoppingList = document.getElementById("itemList");
    shoppingList.innerHTML = "";
    const allLists = JSON.parse(localStorage.getItem("allLists")) || {};
    const items = allLists[currentTitle] || [];

    if (!currentTitle) {
        document.querySelector(".message").style.display = "block";
        document.querySelector(".container").style.display = "none";
    } else {

        document.querySelector(".message").style.display = "none";
        document.querySelector(".container").style.display = "";

        items.forEach((item) => {
            const newItem = createListItem(item);
            shoppingList.appendChild(newItem);
        });

        document.getElementById("shoppingListTitle").textContent = currentTitle;
    }
}

//To save Titles to local storage
function saveTitlesToStorage(titles) {
    localStorage.setItem("titles", JSON.stringify(titles));
}

//To load the titles from the local storage
function loadTitlesFromStorage() {
    const titles = JSON.parse(localStorage.getItem("titles")) || [];
    const storedCurrentTitle = localStorage.getItem("currentTitle");

    const titleList = document.getElementById("titleList");
    titleList.innerHTML = '';

    titles.forEach((title) => {
        const titleDiv = document.createElement("div");
        titleDiv.className = 'title-item';
        titleDiv.style.paddingRight = '70px'; 

        const paragraph = document.createElement("p");
        paragraph.textContent = title;
        titleDiv.appendChild(paragraph);

        titleDiv.onclick = () => {
            const activeTitle = document.querySelector('.title-item.active-title');
            if (activeTitle) {
                activeTitle.classList.remove('active-title');
            }
            titleDiv.classList.add('active-title');
            currentTitle = title;
            localStorage.setItem("currentTitle", currentTitle);
            loadListFromStorage();
        };


        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.className = "delete-btn";
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            deleteTitle(title);
            titleDiv.remove(); 
            saveTitlesToStorage();
        };

        titleDiv.appendChild(deleteBtn);
        titleList.appendChild(titleDiv);
    });

    if (!titles.includes(storedCurrentTitle)) {
        currentTitle = null;
        localStorage.removeItem("currentTitle");
    }

    if (titles.length < 1) {
        document.querySelector(".message").style.display = "block";
        document.querySelector(".item-form").style.display = "block";
        document.querySelector(".item-filters").style.display = "block";
        document.querySelector(".item-list-container").style.display = "block";
    } else {
        document.querySelector(".message").style.display = "none";
        document.getElementById("shoppingListTitle").textContent = currentTitle;
        document.querySelector(".item-form").style.display = "block";
        document.querySelector(".item-filters").style.display = "block";
        document.querySelector(".item-list-container").style.display = "block";
    }
}

//To Delete an individual title
function deleteTitle(titleToDelete) {
    const allLists = JSON.parse(localStorage.getItem("allLists")) || {};
    
    delete allLists[titleToDelete];
    localStorage.setItem("allLists", JSON.stringify(allLists));

    const titles = JSON.parse(localStorage.getItem("titles")) || [];
    const updatedTitles = titles.filter(title => title !== titleToDelete);
    saveTitlesToStorage(updatedTitles);

    if (currentTitle === titleToDelete) {
        currentTitle = null;
        localStorage.removeItem("currentTitle");
    } 

    loadTitlesFromStorage();
    loadListFromStorage();

    if (currentTitle) {
        const titleDivs = document.querySelectorAll('.title-item');
        titleDivs.forEach(titleDiv => {
            if (titleDiv.textContent.replace('x', '').trim() === currentTitle) {
                titleDiv.classList.add('active-title');
            }
        });
    }
}

//Add a title to the title list
function addListTitle() {
    const listTitleInput = document.getElementById("listTitle");
    const listTitle = listTitleInput.value.trim();

    const titles = JSON.parse(localStorage.getItem("titles")) || [];
    if (titles.includes(listTitle)) {
        alert("This title already exists. Please choose a different title.");
        return;
    }

    if (listTitle !== "") {
        const titleList = document.getElementById("titleList");

        const titleDiv = document.createElement("div");
        titleDiv.className = 'title-item';
        titleDiv.textContent = listTitle;
        titleDiv.style.paddingRight = '70px';

        titleDiv.onclick = () => {
            const activeTitle = document.querySelector('.title-item.active-title');
            if (activeTitle) {
                activeTitle.classList.remove('active-title');
            }
            titleDiv.classList.add('active-title');
            currentTitle = listTitle;
            localStorage.setItem("currentTitle", currentTitle);
            loadListFromStorage();
        };
        
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "X";
        deleteBtn.className = "delete-btn";
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            deleteTitle(listTitle);    
        };

        titleDiv.appendChild(deleteBtn);
        titleList.appendChild(titleDiv);

        titles.push(listTitle);
        saveTitlesToStorage(titles);

        currentTitle = listTitle;
        localStorage.setItem("currentTitle", currentTitle);
        document.getElementById("itemList").innerHTML = "";
        listTitleInput.value = "";

        document.querySelectorAll('.title-item').forEach(item => {
            item.classList.remove('active-title');
        });

        titleDiv.classList.add('active-title');

        console.log(`Title added: ${currentTitle}`);

        saveListToStorage();
        loadListFromStorage();
    } else {
        alert("Please enter a title for the shopping list.");
    }
}

//Filter out the items if it is complete or incomplete
function filterItems(filter) {
    const items = document.getElementById("itemList").children;
    const buttons = document.querySelectorAll(".item-filters button");

    buttons.forEach((button) => {
        button.classList.toggle("active", button.textContent.toLowerCase() === filter.toLowerCase());
    });

    Array.from(items).forEach((item) => {
        const isChecked = item.querySelector('input[type="checkbox"]').checked;
        switch (filter) {
            case "all":
                item.style.display = "inline-flex";
                break;
            case "complete":
                item.style.display = isChecked ? "inline-flex" : "none";
                break;
            case "incomplete":
                item.style.display = isChecked ? "none" : "inline-flex";
                break;
        }
    });
    switch (filter) {
        case "all":
            console.log(`Filter applied: All`);
            break;
        case "complete":
            console.log(`Filter applied: Complete`);
            break;
        case "incomplete":
            console.log(`Filter applied: Incomplete`);
            break;
    }
}

//To apply the selected filter
function applyCurrentFilter() {
    const activeButton = document.querySelector(".item-filters .active");
    if (activeButton) {
        const filter = activeButton.textContent.toLowerCase();
        filterItems(filter);
    }
}

//To add an Item to the item list inputted by the user
function addItem() {
    const $itemNameInput = $("#itemName");
    const $itemQuantityInput = $("#itemQuantity");
    const $itemUnitInput = $("#itemUnit");

    const itemName = $itemNameInput.val().trim();
    const itemQuantity = $itemQuantityInput.val().trim();
    const itemUnit = $itemUnitInput.val();

    if (itemName !== "" && itemQuantity !== "" && itemUnit !== "") {
        const $shoppingList = $("#itemList");
        const newItem = createListItem({
            itemName,
            itemQuantity,
            itemUnit,
            isChecked: false,
        });
        $shoppingList.append(newItem);

        $itemNameInput.val("");
        $itemQuantityInput.val("");
        $itemUnitInput.val("pc");

        console.log(`Item added: ${itemName}`);

        saveListToStorage();
    } else {
        alert("Please enter both item name and quantity.");
    }
}

//To sort the item list on Ascending or Descending
function sortItems() {
    const shoppingList = document.getElementById("itemList");
    const items = Array.from(shoppingList.children);
    
    const sortType = document.getElementById("sortSelect").value;

    items.sort((a, b) => {
        const itemA = a.querySelector("label").textContent.toLowerCase();
        const itemB = b.querySelector("label").textContent.toLowerCase();
        
        if (sortType === "asc") {
            if (itemA < itemB) {
                return -1;
            }
            if (itemA > itemB) {
                return 1;
            }
            return 0;
        } else if (sortType === "desc") {
            if (itemA > itemB) {
                return -1;
            }
            if (itemA < itemB) {
                return 1;
            }
            return 0;
        }
    });

    shoppingList.innerHTML = "";
    items.forEach(item => shoppingList.appendChild(item));
}

//Delete all items from local storage
function deleteAllItems() {
    const shoppingList = document.getElementById("itemList");
    shoppingList.innerHTML = "";

    const allLists = JSON.parse(localStorage.getItem("allLists")) || {};
    delete allLists[currentTitle];
    localStorage.setItem("allLists", JSON.stringify(allLists));

    console.log("All items deleted from the list.");
}

//Delete all title from local storage
function deleteAllTitles() {
    const titleList = document.getElementById("titleList");
    titleList.innerHTML = ""; 

    localStorage.removeItem("titles");
    localStorage.removeItem("currentTitle");
    localStorage.removeItem("allLists");

    console.log("All titles deleted from the sidebar.");

    document.querySelector(".message").style.display = "block";
    document.querySelector(".container").style.display = "none";
}