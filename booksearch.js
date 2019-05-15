// The books will be stored in a map object so that they can be
// called by a unique id and stay in order.
let books = (localStorage.getItem("books")) ? new Map(JSON.parse(localStorage.getItem("books"))) : new Map();
document.getElementById("addBookTitle").focus();

// Generates unique ids for books in booklist.
function uuidv4() {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    )
};

// Retrieve default search values from storage
let defaultSearchValues = (localStorage.getItem("defaultSearchValues")) ? 
JSON.parse(localStorage.getItem("defaultSearchValues")) : {defaultMaxPrice: "", resultsPerBook: ""};

// Retrieve default country from storage
let currentCountry = (localStorage.getItem("currentCountry")) ? localStorage.getItem("currentCountry") : "US";

const countries = {
    UK: {
        icon: "uk.svg",
        countryCode: "GB",
        currencyCode: "GBP"
    },
    US: {
        icon: "us.svg",
        countryCode: "US",
        currencyCode: "USD"
    },
    // CA: {
    //     icon: "canada.svg",
    //     countryCode: "ENCA",
    //     currencyCode: "CAD"
    // }
}

// Booklist object
const booklist = {
    books: books,
    addBook: function(title, author, maxPrice) {
        this.books.set(uuidv4().toString(), {
            title: title,
            author: author,
            maxPrice: maxPrice
        });
    },
    editBook: function(id, title, author, maxPrice) {
        if (this.books.has(id)) {
            const book = this.books.get(id);
            book.title = title;
            book.author = author;
            book.maxPrice = maxPrice;
            localStorage.setItem("books", JSON.stringify(Array.from(this.books.entries())));
        }
    },
    deleteBook: function(id) {
        this.books.delete(id);
        localStorage.setItem("books", JSON.stringify(Array.from(this.books.entries())));
    }
};

const handlers = {
    addBook: function() {
        const addBookTitle = document.getElementById("addBookTitle");
        const addBookAuthor = document.getElementById("addBookAuthor"); 
        const addBookMaxPrice = document.getElementById("addBookMaxPrice");
        if (!(addBookTitle.value || addBookAuthor.value)) {
            return false;
        }
        const re = /^\d*\.?\d?\d?$/;
        if (!re.test(addBookMaxPrice.value)) {
            addBookMaxPrice.value = "";
        }
        booklist.addBook(addBookTitle.value, addBookAuthor.value, addBookMaxPrice.value);
        addBookTitle.value = "";
        addBookAuthor.value = "";
        addBookMaxPrice.value = "";
        view.displayBooklist();
        addBookTitle.focus();   
    },
    editBook: function(id) {
        if (id) {
            const bookLi = document.getElementById(id);
            const bookTitle = bookLi.querySelector(".title").value;
            const bookAuthor = bookLi.querySelector(".author").value;
            const bookMaxPrice = bookLi.querySelector(".maxPrice").value;
            booklist.editBook(id, bookTitle, bookAuthor, bookMaxPrice);
        }
    },
    deleteBook: function(id) {
        booklist.deleteBook(id);

        const bookLi = document.getElementById(id);
        bookLi.style.animationPlayState = "running";
    },
    badInput: function(inputField) {
        const re = /^\d*\.?\d?\d?$/;
        if (!re.test(inputField.value)) {
            inputField.classList.add("badInput");
        } else {
            inputField.classList.remove("badInput");
            handlers.editBook(inputField.parentNode.parentNode.id);
        }
    },
    removeBadInput: function(inputField) {
        const re = /^\d*\.?\d?\d?$/;
        if (!re.test(inputField.value)) {
            inputField.value = "";
            inputField.classList.remove("badInput");
        }
    },
    badDefault: function(defaultField) {
        const reDecimal = /^\d*\.?\d?\d?$/;
        const reNumeral = /^\d*$/;
        if ((!reDecimal.test(defaultField.value) && defaultField.id === "defaultMaxPrice") ||
        !reNumeral.test(defaultField.value) && defaultField.id === "resultsPerBook") {
            defaultField.classList.add("badInput");
        } else {
            defaultField.classList.remove("badInput");
            defaultSearchValues[defaultField.id] = defaultField.value;
            localStorage.setItem("defaultSearchValues", JSON.stringify(defaultSearchValues));
        }
    },
    removeBadDefault: function(defaultField) {
        const reDecimal = /^\d*\.?\d?\d?$/;
        const reNumeral = /^\d*$/;
        if ((!reDecimal.test(defaultField.value) && defaultField.id === "defaultMaxPrice") ||
        !reNumeral.test(defaultField.value) && defaultField.id === "resultsPerBook") {
            defaultField.value = "";
            defaultField.classList.remove("badInput");
        }
    },
    getEbayResults: function() {
        document.getElementById("booklistDiv").style.display = "none";
        document.getElementById("ebayResults").innerHTML = "<hr>";
        booklist.books.forEach(function(book) {
            const searchTerm = `${book.title} ${book.author}`;

            const fallbackBudget = (defaultSearchValues.defaultMaxPrice) ? defaultSearchValues.defaultMaxPrice : "5";
            const fallbackResults = (defaultSearchValues.resultsPerBook) ? defaultSearchValues.resultsPerBook : "5";
        
            maxPrice = (book.maxPrice) ? book.maxPrice : fallbackBudget;
            console.log("book price", book.maxPrice);
            console.log(book.title, book.maxPrice, fallbackBudget);
            const filterarray = constructFilterArray(maxPrice, countries[currentCountry]["currencyCode"]);
            const urlfilter = buildURLArray(filterarray);
            const url = constructURL(urlfilter, searchTerm, countries[currentCountry]["countryCode"], fallbackResults);

            // Submit the request
            s=document.createElement('script'); // create script element
            s.src= url;
            document.body.appendChild(s);

        })
        document.getElementById("results").style.display = "block";
    },
    toBookList: function() {
        document.getElementById("booklistDiv").style.display = "block";
        document.getElementById("results").style.display = "none";
    },
    linkHover: function(link) {
        link.querySelector("img").className = "visibleHoverImg";
    },
    // openCountrySelector: function() {
    //     const countryContainer = document.querySelector("#countryContainer");
    //     countryContainer.focus();
    // },
    selectCountry: function(icon) {
        localStorage.setItem("currentCountry", icon.id);
        currentCountry = icon.id;
        view.displayCurrentCountry();
    }
};

var view = {
    displayCurrentCountry: function() {
        const countryContainer = document.getElementById("countryContainer");
        if (countryContainer.childNodes.length === 2) {
            countryContainer.removeChild(countryContainer.lastChild);
        };
        const icon = document.createElement("img");
        icon.src = countries[currentCountry]["icon"];
        icon.classList.add("currentCountry");
        icon.addEventListener("click", () => {
            handlers.openCountrySelector();
        });
        countryContainer.appendChild(icon);

        // Populate countryDropdown with other options
        const countryDropdown = countryContainer.querySelector("#countryDropdown");
        while (countryDropdown.lastChild) {
            countryDropdown.removeChild(countryDropdown.lastChild);
        };
        for (let country of Object.keys(countries)) {
            if (country !== currentCountry) {
                const icon = document.createElement("img");
                icon.src = countries[country]["icon"];
                icon.classList.add("unselectedCountry");
                icon.id = country;
                icon.addEventListener("click", () => {
                    handlers.selectCountry(icon);
                });
                countryDropdown.appendChild(icon);
            }
        }
    },
    displayDefaultSearchValues: function() {
        document.getElementById("defaultMaxPrice").value = defaultSearchValues.defaultMaxPrice;
        document.getElementById("resultsPerBook").value = defaultSearchValues.resultsPerBook;
    },
    displayBooklist: function() {
        view.displayDefaultSearchValues();
        view.displayCurrentCountry();

        localStorage.setItem("books", JSON.stringify(Array.from(booklist.books.entries())));
        const booklistUl = document.querySelector("ul.booklist");
        booklistUl.innerHTML = "";
        booklist.books.forEach(function(book, id) {
            const bookLi = document.createElement('li');
            const titleInput = document.createElement('input');
            const authorInput = document.createElement('input');
            const maxPriceInput = document.createElement('input');

            titleInput.value = book.title;
            titleInput.className = "title";

            authorInput.value = book.author;
            authorInput.className = "author";

            maxPriceInput.value = book.maxPrice;
            maxPriceInput.className = "maxPrice";

            bookLi.id = id;
            bookLi.appendChild(titleInput);
            bookLi.appendChild(authorInput);

            const div = document.createElement('div');
            div.className = "budgetButtonWrapper";
            div.appendChild(maxPriceInput);
            div.appendChild(view.createDeleteButton());
            bookLi.appendChild(div);
            booklistUl.appendChild(bookLi);
        }, this);
    },
    createDeleteButton: function() {
        const deleteButton = document.createElement("button");
        deleteButton.innerHTML = "&times;";
        deleteButton.className = "deleteButton";
        return deleteButton;
    },
    setUpEventListeners: function() {

        const booklistUl = document.querySelector("ul");
        booklistUl.addEventListener("click", function(event) {
            const elementClicked = event.target;
            if (elementClicked.className === "deleteButton") {
                handlers.deleteBook(elementClicked.parentNode.parentNode.id);
            };
        });
        document.querySelectorAll("li .title, li .author").forEach(function(bookField) {
            bookField.addEventListener("input", () => {
                handlers.editBook(bookField.parentNode.id); 
            });
        });
        document.querySelectorAll(".maxPrice").forEach(function(inputField) {
            inputField.addEventListener("input", () => {
                handlers.badInput(inputField);
            });
            inputField.addEventListener("blur", () => {
                handlers.removeBadInput(inputField);
            });
        });
        document.querySelectorAll("ul.booklist li").forEach(function(bookLi) {
            bookLi.addEventListener("animationend", this.displayBooklist)
        }, this);
        document.querySelectorAll(".toBooklist").forEach(function(button) {
            button.addEventListener("click", () => {
                handlers.toBookList();
            });
        });
        document.querySelectorAll(".getResults").forEach(function(button) {
            button.addEventListener("click", () => {
                handlers.getEbayResults();
            });
        });
        document.querySelectorAll("#defaultsWrapper input").forEach(function(defaultField) {
            defaultField.addEventListener("input", () => {
                handlers.badDefault(defaultField);
            });
            defaultField.addEventListener("blur", () => {
                handlers.removeBadDefault(defaultField);
            });
        });
        // document.querySelector(".currentCountry").addEventListener("click", () => {
        //     debugger;
        //     handlers.openCountrySelector();
        // });
        // document.querySelectorAll(".unselectedCountry").forEach(function(icon) {
        //     icon.addEventListener("click", () => {
        //         handlers.selectCountry(icon);
        //     })
        // })
    }   
};

view.displayBooklist();
view.setUpEventListeners();



// Parse the response and build an HTML table to display search results
function _cb_findItemsByKeywords(root) {
    const items = root.findItemsByKeywordsResponse[0].searchResult[0].item || [];
    items.sort((item1, item2) => {
        function getPrice(item) {
            const sellingStatus = item.sellingStatus && item.sellingStatus[0] || {};
            const currentPrice = sellingStatus.currentPrice && sellingStatus.currentPrice[0] || {};
            return [currentPrice['@currencyId'], Number(currentPrice['__value__'])];
        }
        item1["price"] = getPrice(item1);
        item2["price"] = getPrice(item2);
        if (item1["price"][0] === item2["price"][0]) {
            return item1["price"][1] - item2["price"][1];
        }
        return 0;
    });
    const html = [];
    for (let i = 0; i < items.length; ++i) {
        const item     = items[i];
        const title    = item.title;
        const pic      = item.galleryURL;
        const viewitem = item.viewItemURL;
        const displayPrice = item["price"][1].toString() + " " + item["price"][0];
        if (null != title && null != viewitem) {
            html.push('<div class="resultWrapper"><h4>' + displayPrice + 
            '</h4><a href="' + viewitem + '" target="_blank">' + title + 
            '<div><img src="' + pic + '" border="0"></div></a></div>');
        }
    }

    const url = root.findItemsByKeywordsResponse[0].itemSearchURL[0];
    const startPosition = url.search("&_nkw=") + 6;
    const endPosition = url.search("&fscurrency");
    const rawSearchTerm = decodeURIComponent(url.slice(startPosition, endPosition));
    const searchTerm = rawSearchTerm.replace(/\+/g, " ");
    let title = "";
    if (html.length !== 0) {
        title = "<h3 class='title'>" + searchTerm + "</h3><br>";
        html.push('<hr>')
    };    
    document.getElementById("ebayResults").innerHTML += title + html.join("");
}  // End _cb_findItemsByKeywords() function

// Create a JavaScript array of the item filters you want to use in your request
function constructFilterArray(maxPrice, currency) {
    return [
        {"name":"MaxPrice",
        "value":maxPrice,
        "paramName":"Currency",
        "paramValue":currency},
        {"name":"FreeShippingOnly",
        "value":"true",
        "paramName":"",
        "paramValue":""},
        {"name":"ListingType",
        "value":["AuctionWithBIN", "FixedPrice"],
        "paramName":"",
        "paramValue":""},
    ];
}

// Generates an indexed URL snippet from the array of item filters
function  buildURLArray(filterarray) {
    // Define global variable for the URL filter
    let urlfilter = "";
    // Iterate through each filter in the array
    for(var i=0; i<filterarray.length; i++) {
    //Index each item filter in filterarray
    var itemfilter = filterarray[i];
    // Iterate through each parameter in each item filter
    for(var index in itemfilter) {
        // Check to see if the paramter has a value (some don't)
        if (itemfilter[index] !== "") {
        if (itemfilter[index] instanceof Array) {
            for(var r=0; r<itemfilter[index].length; r++) {
            var value = itemfilter[index][r];
            urlfilter += "&itemFilter\(" + i + "\)." + index + "\(" + r + "\)=" + value ;
            }
        }
        else {
            urlfilter += "&itemFilter\(" + i + "\)." + index + "=" + itemfilter[index];
        }
        }
    }
    }
    return urlfilter;
}  // End buildURLArray() function



// Construct the request
function constructURL(urlfilter, searchTerm, siteLocationCode, numEntries) {
    let url = "https://svcs.ebay.com/services/search/FindingService/v1";
    url += "?OPERATION-NAME=findItemsByKeywords";
    url += "&SERVICE-VERSION=1.0.0";
    url += "&SECURITY-APPNAME=AdamSher-Booksear-PRD-38dd99240-7ddfbe7a";
    url += `&GLOBAL-ID=EBAY-${siteLocationCode}`;
    url += "&siteid=0"
    url += "&RESPONSE-DATA-FORMAT=JSON";
    url += "&callback=_cb_findItemsByKeywords";
    url += "&REST-PAYLOAD";
    url += `&keywords=${searchTerm}`;
    url += `&paginationInput.entriesPerPage=${numEntries}`;
    //url += urlfilter;
    
    fetch(url)
    .then(res => res.json())
    .then(data => console.log(data))
    .cathc(err => console.log(err));
    
    return url
}


