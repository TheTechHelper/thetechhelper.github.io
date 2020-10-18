$(function() {
    console.log(`
    TechHelper
    Made in 2020 by Sebastian Doe                                                               
    `)
    $('#bookmarks').click(function() {
        if (window.sidebar && window.sidebar.addPanel) {
            window.sidebar.addPanel(document.title, url, '');
        } else if (window.external && ('AddFavorite' in window.external)) {
            window.external.AddFavorite(url, document.title);
        } else if (window.opera && window.print) {
            this.title = document.title;
            return true;
        } else {
            alert('Go to the homepage and press ' + (navigator.userAgent.toLowerCase().indexOf('mac') != -1 ? 'Command/Cmd' : 'CTRL') + ' + D to bookmark this page.');
        }
    });
});

function refreshSearch(searchInput) {
    var input = $(searchInput).val().toLowerCase();
    $('#resultsList').children('a').each(function() {
        var keywords = $(this).attr("keywords").toLowerCase();
        var title = $(this).text().toLowerCase();
        if (title.includes(input) || keywords.includes(input)) {
            $(this).show();
        } else {
            $(this).hide();
        }
    });
}

function getURLParameter(name) {
    return decodeURIComponent((new RegExp("[?|&]" + name + "=" + "([^&;]+?)(&|#|;|$)").exec(location.search) || [null, ""])[1].replace(/\+/g, "%20")) || null;
}

// FIREBASE REFS

function indexLoad() {
    firebase.database().ref("/").on('value', function(snap){
        snap.forEach(function(childNodes){
            var url = "/category?choice=" + childNodes.val().name.toLowerCase();
            $(".byDevice").append(`
                <span class="flair" style="background-color: #` + childNodes.val().color + `;"><a class="flairLink" href="` + url + `">` + childNodes.val().name.toUpperCase() + `</a></span>
            `);
       });
    });
}

function categoryLoad() {
    var choice = getURLParameter("choice");
    firebase.database().ref(choice).on('value', function(snap){
        $(document).prop('title', snap.val().name + " | TechHelper");
        $(".pluralDescription").text(snap.val().plural);
        $(".deviceName").text(snap.val().name.toLowerCase());
    });
    firebase.database().ref(choice + "/subcategories/").on('value', function(snap){
        snap.forEach(function(childNodes){
            var url = "/subcategory?choice=" + choice + "&subchoice=" + childNodes.val().name.toLowerCase();
            $(".categoryItems").append(`
                <span class="flair" style="background-color: #` + childNodes.val().color + `;"><a class="flairLink" href="` + url + `">` + childNodes.val().name.toUpperCase() + `</a></span>
            `);
       });
    });
}

function subcategoryLoad() {
    var choice = getURLParameter("choice");
    var subchoice = getURLParameter("subchoice");
    firebase.database().ref(choice + "/subcategories/" + subchoice + "/").on('value', function(snap){
        $(document).prop('title', snap.val().name + " | TechHelper");
        $(".pluralDescription").text(snap.val().name);
        $(".deviceName").text(snap.val().name.toLowerCase());
    });
    firebase.database().ref(choice + "/subcategories/" + subchoice + "/articles/").on('value', function(snap){
        snap.forEach(function(childNodes){
            var url = "/article?choice=" + choice + "&subchoice=" + subchoice + "&article=" + childNodes.val().num;
            if (childNodes.val().pinned == true) {
                $("#pinnedResultsList").append(`
                <a class="searchResult" href="` + url + `" keywords="` + childNodes.val().keywords + `">` + childNodes.val().title + `<br><br></a>
                `);
            } else {
                $("#resultsList").append(`
                <a class="searchResult" href="` + url + `" keywords="` + childNodes.val().keywords + `">` + childNodes.val().title + `<br><br></a>
                `);
            }
       });
    });
    $(".pluralDescription").text();
    setTimeout(function() {
        console.log($(".pluralDescription").text());
        if ($(".pluralDescription").text() == "Loading") {
            $(".title").text("Category Not Found");
            $(".description").text("We're sorry, but we weren't able to find the category you were looking for.");
            $(".categoryItems").append(`
                <span class="flair" style="background-color: orange;"><a class="flairLink" href="/">HOME</a></span><br>
            `);
        }
    }, 3000);
}

function articleLoad() {
    var choice = getURLParameter("choice");
    var subchoice = getURLParameter("subchoice");
    var articleNumber = getURLParameter("article");
    firebase.database().ref(choice + "/subcategories/" + subchoice + "/articles/" + articleNumber + "/").on('value', function(snap){
        $(document).prop('title', snap.val().title + " | TechHelper");
        $(".title").text(snap.val().title);
        $(".contents").text(snap.val().contents);
        $(".topFlair.choice").css("background-color")
        $(".sections").show();
    });
    firebase.database().ref(choice + "/").on('value', function(snap){
        $(".topFlair.choice").css("background-color", "#" + snap.val().color);
        $(".flairLink.choice").attr("href", "/category?choice=" + snap.val().name.toLowerCase());
        $(".flairLink.choice").text(snap.val().name.toUpperCase());
    });
    firebase.database().ref(choice + "/subcategories/" + subchoice + "/").on('value', function(snap){
        $(".topFlair.subchoice").css("background-color", "#" + snap.val().color);
        $(".flairLink.subchoice").attr("href", "/category?choice=" + choice.toLowerCase() + "&subchoice=" + subchoice.toLowerCase());
        $(".flairLink.subchoice").text(snap.val().name.toUpperCase());
    });
}