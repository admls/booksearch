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
        console.log("----------------")
        const books = new Map(JSON.parse(localStorage.getItem("books")))
        books.forEach(function(book) {
            console.log(book.title)
        })
        console.log("----------------")
        const bookLi = document.getElementById(id);
        bookLi.style.animationPlayState = "running";
    },
    badInput: function(inputField) {
        const re = /^\d*\.?\d?\d?$/;
        if (!re.test(inputField.value)) {
            inputField.classList.add("badInput");
        } else {
            inputField.classList.remove("badInput");
            handlers.editBook(inputField.parentNode.id);
        }
    },
    removeBadInput: function(inputField) {
        const re = /^\d*\.?\d?\d?$/;
        if (!re.test(inputField.value)) {
            inputField.value = "";
            inputField.classList.remove("badInput");
        }
    },
    getEbayResults: function() {
        document.getElementById("booklistDiv").style.display = "none";
        document.getElementById("ebayResults").innerHTML = "<hr>";
        booklist.books.forEach(function(book) {
            const searchTerm = `${book.title} ${book.author}`;

            maxPrice = (book.maxPrice) ? book.maxPrice : "3";
            const filterarray = constructFilterArray(maxPrice, "GBP");
            const urlfilter = buildURLArray(filterarray);
            const url = constructURL(urlfilter, searchTerm, "GB", "2");

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
    }
  };

var view = {
    displayBooklist: function() {
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

            // bookLi.appendChild(maxPriceInput);
            // bookLi.appendChild(view.createDeleteButton());
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
            })
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
    }   
};

view.displayBooklist();
view.setUpEventListeners();



// Parse the response and build an HTML table to display search results
function _cb_findItemsByKeywords(root) {
    // console.log(root);
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
    let url = "http://svcs.ebay.com/services/search/FindingService/v1";
    url += "?OPERATION-NAME=findItemsByKeywords";
    url += "&SERVICE-VERSION=1.0.0";
    url += "&SECURITY-APPNAME=AdamSher-Booksear-PRD-38dd99240-7ddfbe7a";
    url += `&GLOBAL-ID=EBAY-${siteLocationCode}`;
    url += "&RESPONSE-DATA-FORMAT=JSON";
    url += "&callback=_cb_findItemsByKeywords";
    url += "&REST-PAYLOAD";
    url += `&keywords=${searchTerm}`;
    url += `&paginationInput.entriesPerPage=${numEntries}`;
    url += urlfilter;
    return url
}


