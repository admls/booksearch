let books = (localStorage.getItem("books")) ? JSON.parse(localStorage.getItem("books")) : [];
document.getElementById("addBookTitle").focus();


const booklist = {
    books: books,
    addBook: function(title, author, maxPrice) {
        this.books.push({
            title: title,
            author: author,
            maxPrice: maxPrice
        });
    },
    confirmEditBook: function(position, title, author, maxPrice) {
        this.books[position].title = title;
        this.books[position].author = author;
        this.books[position].maxPrice = maxPrice;
    },
    deleteBook: function(position) {
        this.books.splice(position, 1);
    }
};

const handlers = {
    addBook: function() {
        const addBookTitle = document.getElementById("addBookTitle");
        const addBookAuthor = document.getElementById("addBookAuthor"); 
        const addBookMaxPrice = document.getElementById("addBookMaxPrice");
        booklist.addBook(addBookTitle.value, addBookAuthor.value, addBookMaxPrice.value);
        addBookTitle.value = "";
        addBookAuthor.value = "";
        addBookMaxPrice.value = "";
        debugger;
        view.displayBooklist();
        addBookTitle.focus();
    },
    editBook: function(position) {
        let bookLi = document.getElementById(position);
        const editingBookLi = document.createElement('li');
        editingBookLi.id = position;

        const editingTitle = document.createElement('input');
        editingTitle.value = bookLi.querySelector(".title").textContent;
        editingTitle.className = "title";

        const editingAuthor = document.createElement('input');
        editingAuthor.value = bookLi.querySelector(".author").textContent;
        editingAuthor.className = "author";

        const editingMaxPrice = document.createElement('input');
        editingMaxPrice.className = "maxPrice";
        editingMaxPrice.value = bookLi.querySelector(".maxPrice").textContent;

        editingBookLi.appendChild(editingTitle);
        editingBookLi.appendChild(editingAuthor);
        editingBookLi.appendChild(editingMaxPrice);

        editingBookLi.appendChild(view.createConfirmEditButton());
        editingBookLi.appendChild(view.createCancelEditButton());
        editingBookLi.appendChild(view.createDeleteButton());
        bookLi.replaceWith(editingBookLi);
    },
    cancelEditBook: function() {
        view.displayBooklist();
    },
    confirmEditBook: function(position) {
        const editingBookLi = document.getElementById(position);
        const bookTitle = editingBookLi.querySelector(".title").value;
        const bookAuthor = editingBookLi.querySelector(".author").value;
        const bookMaxPrice = editingBookLi.querySelector(".maxPrice").value;
        console.log(bookTitle);
        console.log(bookAuthor);
        console.log(bookMaxPrice);
        booklist.confirmEditBook(position, bookTitle, bookAuthor, bookMaxPrice);
        view.displayBooklist();
    },
    deleteBook: function(position) {
        booklist.deleteBook(position);
        view.displayBooklist();
    }
  };

var view = {
    displayBooklist: function() {
        localStorage.setItem("books", JSON.stringify(booklist.books));
        const booklistUl = document.querySelector("ul.booklist");
        booklistUl.innerHTML = "";
        booklist.books.forEach(function(book, position) {
            const bookLi = document.createElement('li');
            const titleSpan = document.createElement('span');
            const authorSpan = document.createElement('span');
            const maxPriceSpan = document.createElement('span');

            titleSpan.textContent = book.title;
            titleSpan.className = "title";
            authorSpan.textContent = book.author;
            authorSpan.className = "author";
            maxPriceSpan.textContent = book.maxPrice;
            maxPriceSpan.className = "maxPrice";
            bookLi.id = position;
            bookLi.appendChild(titleSpan);
            bookLi.appendChild(authorSpan);
            bookLi.appendChild(maxPriceSpan);
            bookLi.appendChild(this.createEditButton());
            bookLi.appendChild(this.createDeleteButton());
            booklistUl.appendChild(bookLi);
        }, this);
    },
    createEditButton: function() {
        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.className = "editButton";
        return editButton
    },
    createConfirmEditButton: function() {
        const confirmEditButton = document.createElement("button");
        confirmEditButton.textContent = "Confirm";
        confirmEditButton.className = "confirmEditButton";
        return confirmEditButton;
    },
    createCancelEditButton: function() {
        const cancelEditButton = document.createElement("button");
        cancelEditButton.textContent = "Cancel";
        cancelEditButton.className = "cancelEditButton";
        return cancelEditButton;
    },
    createDeleteButton: function() {
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.className = "deleteButton";
        return deleteButton;
    },
    setUpEventListeners: function() {
        const booklistUl = document.querySelector("ul");

        booklistUl.addEventListener("click", function(event) {
            const elementClicked = event.target;
            console.log(elementClicked);
            if (elementClicked.className === "deleteButton") {
                handlers.deleteBook(parseInt(elementClicked.parentNode.id));
            } else if (elementClicked.className === "editButton") {
                handlers.editBook(parseInt(elementClicked.parentNode.id));
            } else if (elementClicked.className === "confirmEditButton") {
                handlers.confirmEditBook(parseInt(elementClicked.parentNode.id));
            } else if (elementClicked.className === "cancelEditButton") {
                handlers.cancelEditBook();
            };
        });

        document.querySelectorAll(".getResults").forEach(function(button) {
            button.addEventListener("click", function() {
                document.getElementById("booklist").style.display = "none";
                
                document.getElementById("ebayResults").innerHTML = "";

                booklist.books.forEach(function(book) {
                    const searchTerm = `${book.title} ${book.author}`;

                    maxPrice = (book.maxPrice) ? book.maxPrice : "3";
                    const filterarray = constructFilterArray(maxPrice, "GBP");
                    const urlfilter = buildURLArray(filterarray);
                    const url = constructURL(urlfilter, searchTerm, "GB", "10");

                    // Submit the request
                    s=document.createElement('script'); // create script element
                    s.src= url;
                    document.body.appendChild(s);

                })
                document.getElementById("results").style.display = "block";
            });
        });
        document.querySelectorAll(".toBooklist").forEach(function(button) {
            button.addEventListener("click", function() {
                document.getElementById("booklist").style.display = "block";
                document.getElementById("results").style.display = "none";
            });
        });
    }   
};

view.displayBooklist();
view.setUpEventListeners();



// Parse the response and build an HTML table to display search results
function _cb_findItemsByKeywords(root) {
    var items = root.findItemsByKeywordsResponse[0].searchResult[0].item || [];
    var html = [];
    html.push('<table width="100%" border="0" cellspacing="0" cellpadding="3"><tbody>');
    for (var i = 0; i < items.length; ++i) {
        var item     = items[i];
        var title    = item.title;
        var pic      = item.galleryURL;
        var viewitem = item.viewItemURL;
        var sellingStatus = item.sellingStatus && item.sellingStatus[0] || {};
        var currentPrice = sellingStatus.currentPrice && sellingStatus.currentPrice[0] || {};
        var displayPrice = currentPrice['@currencyId'] + ' ' + currentPrice['__value__'];
        if (null != title && null != viewitem) {
            html.push('<tr><td>' + '<img src="' + pic + '" border="0">' + '</td>' +
            '<td><a href="' + viewitem + '" target="_blank">' + title + '</a><h3>' +displayPrice+ '</h3></td></tr>');
        }
    }
    html.push('</tbody></table>');
    document.getElementById("ebayResults").innerHTML += html.join("");
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


// function _cb_findItemsByKeywords(root) {
//     var items = root && root.findItemsByKeywordsResponse && root.findItemsByKeywordsResponse[0] && root.findItemsByKeywordsResponse[0].searchResult && root.findItemsByKeywordsResponse[0].searchResult[0] && root.findItemsByKeywordsResponse[0].searchResult[0].item || [];
//     var html = []; html.push('<table width="100%" border="0" cellspacing="0" cellpadding="3"><tbody>');
//     for (var i = 0; i < items.length; ++i) {
//         var item = items[i];
//         var shippingInfo = item.shippingInfo && item.shippingInfo[0] || {};
//         var sellingStatus = item.sellingStatus && item.sellingStatus[0] || {};
//         var listingInfo = item.listingInfo && item.listingInfo[0] || {};
//         var title = item.title;
//         var subtitle = item.subtitle || '';
//         var pic = item.galleryURL;
//         var viewitem = item.viewItemURL;
//         var currentPrice = sellingStatus.currentPrice && sellingStatus.currentPrice[0] || {};
//         var displayPrice = currentPrice['@currencyId'] + ' ' + currentPrice['__value__'];
//         var buyItNowAvailable = listingInfo.buyItNowAvailable && listingInfo.buyItNowAvailable[0] === 'true';
//         var freeShipping = shippingInfo.shippingType && shippingInfo.shippingType[0] === 'Free';
//         if (null !== title && null !== viewitem) {
//             html.push('<tr><td class="image-container"><img src="' + pic + '"border = "0"></td>');
//             html.push('<td class="data-container"><a class="item-link" href="' + viewitem + '"target="_blank">');
//             html.push('<p class="title">' + title + '</p>'); html.push('<p class="subtitle">' + subtitle + '</p>');
//             html.push('<p class="price">' + displayPrice + '</p>');
//             if (buyItNowAvailable) {
//                 html.push('<p class="bin">Buy It Now</p>');
//             }
//             if (freeShipping) {
//                 html.push('<p class="fs">Free shipping</p>');
//             }
//             html.push('</a></td></tr>');
//         }
//     }
//     html.push(" </tbody></table>");
//     document.getElementById("ebayResults").innerHTML = html.join("");
// } 

// function createSrc() {
//     return `https://svcs.ebay.com/services/search/FindingService/v1?SECURITY-APPNAME=AdamSher-Booksear-PRD-38dd99240-7ddfbe7a&OPERATION-NAME=findItemsByKeywords&SERVICE-VERSION=1.0.0&RESPONSE-DATA-FORMAT=JSON&callback=_cb_findItemsByKeywords&REST-PAYLOAD&keywords=${searchTerm}&paginationInput.entriesPerPage=6&GLOBAL-ID=EBAY-${location}&siteid=3`
// }
