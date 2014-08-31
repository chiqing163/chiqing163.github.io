var geseBook = {
    3: { url: '/product.aspx?product_id=22832478' },
    4: { url: '/product.aspx?product_id=22832477' },
    5: { url: '/product.aspx?product_id=22832476' },
    6: { url: '/product.aspx?product_id=22832475' },
    7: { url: '/product.aspx?product_id=22832474' }
};

var i = 0;
for (var level in geseBook) {
    var info = geseBook[level];
    setTimeout(function(info) {
        console.log(info.url);
        $.ajax({ 
            url: info.url, 
            context: info,
            complete: function onfinishGetHTML(xhr) {
                var dom = $(xhr.responseText);
                var text = dom.find('#comm_num_down i').html();
                this.count = text;
                printBookSelled();
            }
        });
    }, 1000 * i, info);
    i++;
}

function onfinishGetHTML(xhr) {
    var dom = $($(xhr.responseText).context);
    var text = dom.find('#comm_num_down i').html();
    this.count = text;
    printBookSelled();
}

function printBookSelled() {
    var book = [];
    for (var level in geseBook) {
        var info = geseBook[level];
        book.push(level + '(' + (info.count || '') + ')');
    }
    document.title = book.join(',');
}
