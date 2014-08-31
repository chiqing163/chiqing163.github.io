(function(win) {
    _default = { content: function(item) { return { html: item.outerHTML }; } };
    var _matcher = [];

    var add = function(option) {
        if (typeof option == 'undefined') return;
        var match = option.match,
            setting = option.setting;
        if (!match || !setting) return;
        if (setting.disable) { return; }
        _matcher.push(option);
    };

    var _getUrls = function(setting) {
        if (setting.getUrls) return setting.getUrls();
        var url = setting.urls,
            base = url.base,
            start = url.start || 1,
            len = url.len || 1,
            step = url.step || 1;
        var urls = [];
        for (var i = start, l = len; i <= l; i++) {
            var page = start + (i - 1) * step;
            urls.push(base + page);
        }
        return urls;
    };

    var launch = function() {
        var href = document.location.href;
        var matcher;
        for (var i = 0, l = _matcher.length; i < l; i++) {
            matcher = _matcher[i];
            var m = matcher.match;
            if (href.substr(0, m.length) == m) {
                break;
            }
        }

        if (!matcher) return;
        this.setup(matcher.setting);
        var urls = _getUrls(matcher.setting);
        this.run(urls);
    };

    var setup = function(option) {
        this.option = option;
        this.option.content = this.option.content || this.def.content;
    };

    var craw = function(option) {
        var html = option.html,
            url = option.url;
        var item = this.option.content(jQuery(html), url);
        item && this.all.push(item);
        html = '';
    };

    var run = function(urls) {
        if (!urls) return;
        var me = this;
        for (var i = 0, l = urls.length; i < l; i++) {
            var item = urls[i];
            jQuery.ajax({
                url: item,
                context: { num: i, url: item },
                complete: function(data) {
                    var html = data.responseText;
                    me.craw({
                        html: html, url: this.url
                    });
                    console.log(this.num);
                    html = '';
                }
            });
        }
    };

    var intervalRunner = function(urls) {
        if (!urls) return;
        var me = this;
        for (var i = 0, l = urls.length; i < l; i++) {
            (function(e) {
                setTimeout(function() {
                    if (nop.error.length >= 10) return;
                    var item = urls.shift();
                    jQuery.ajax({
                        url: item,
                        context: { num: i, url: item },
                        complete: function(data) {
                            if (data.readyState !== 4 || data.status !== 200) return;
                            var html = data.responseText;
                            nop.craw({
                                html: html, url: this.url
                            });
                            console.log(this.num);
                            html = '';
                        },
                        error: function(e) {
                            var MAX_ERROR = 10;
                            if (!nop.error) nop.error = [];
                            nop.error.push({ id: item.substr(29), err: e });
                            console.log('error:' + i + ',item:' + item);
                        }
                    });
                }, 25 * (i + 1));
            })(i);
        }
    };


    var rerun = function(urls, i) {
        if (i >= urls.length) return;
        var item = urls[i];
        jQuery.ajax({
            url: item,
            context: { num: i, url: item },
            complete: function(data) {
                if (data.readyState !== 4 || data.status !== 200) return;
                var html = data.responseText;
                nop.craw({
                    html: html, url: this.url
                });
                console.log(this.num);
                html = '';

                rerun(urls, i + 1);
            },
            error: function(e) {
                var MAX_ERROR = 10;
                if (!nop.error) nop.error = [];
                nop.error.push({ id: item.substr(29), err: e });
                console.log('error:' + i + ',item:' + item);
                if (nop.error && nop.error.length >= MAX_ERROR) return;
                rerun(urls, i + 1);
            }
        });
    };

    var singlerunner = function(urls) {
        if (!urls) return;
        var me = this;
        rerun(urls, 0);
    };

    var show = function() {
        var items = this.all;
        var html = [];
        for (var i = 0, l = items.length; i < l; i++) {
            html.push(items[i].html);
        }
        jQuery(this.option.containerId).html(html.join(''));
        return items;
    };

    var rununtil = function() {
    };

    window.nop = {
        def: _default,
        option: null,
        run: singlerunner,
        show: show,
        setup: setup,
        craw: craw,
        add: add,
        launch: launch,
        all: []
    };
} (window));

nop.add({
    match: 'http://www.dianping.com',
    setting: {
        content: function(html, url) {
            try {
                var container = $(html);
                return $.map(container.find('#searchList dd li.shopname>a'),function(n){return n.href});
            } catch (e) {
                if (!nop.error) nop.error = [];
                nop.error.push({ id: url.substr(29), err: e });
            }
        },
        getUrls: function() {
			var  idlist = [{"url":"http://www.dianping.com/search/category/17/10/g793r0","num":237},{"url":"http://www.dianping.com/search/category/17/10/g789r0","num":342},{"url":"http://www.dianping.com/search/category/17/10/g787r0","num":298},{"url":"http://www.dianping.com/search/category/17/10/g798r0","num":95},{"url":"http://www.dianping.com/search/category/17/10/g797r0","num":499},{"url":"http://www.dianping.com/search/category/17/10/g809r0","num":235},{"url":"http://www.dianping.com/search/category/17/10/g813r0","num":223},{"url":"http://www.dianping.com/search/category/17/10/g1497r0","num":59},{"url":"http://www.dianping.com/search/category/17/10/g1498r0","num":342},{"url":"http://www.dianping.com/search/category/17/10/g786r123","num":207},{"url":"http://www.dianping.com/search/category/17/10/g786r124","num":105},{"url":"http://www.dianping.com/search/category/17/10/g786r125","num":111},{"url":"http://www.dianping.com/search/category/17/10/g786r126","num":204},{"url":"http://www.dianping.com/search/category/17/10/g786r127","num":91},{"url":"http://www.dianping.com/search/category/17/10/g786r129","num":92},{"url":"http://www.dianping.com/search/category/17/10/g786r467","num":95},{"url":"http://www.dianping.com/search/category/17/10/g786r5412","num":17},{"url":"http://www.dianping.com/search/category/17/10/g786r5413","num":4},{"url":"http://www.dianping.com/search/category/17/10/g786r5414","num":22},{"url":"http://www.dianping.com/search/category/17/10/g786r128","num":50},{"url":"http://www.dianping.com/search/category/17/10/g2679r0","num":504},{"url":"http://www.dianping.com/search/category/17/10/g3073r0","num":82},{"url":"http://www.dianping.com/search/category/17/10/g3075r0","num":245},{"url":"http://www.dianping.com/search/category/17/10/g3077r0","num":298},{"url":"http://www.dianping.com/search/category/17/10/g3079r0","num":261},{"url":"http://www.dianping.com/search/category/17/10/g3081r0","num":700},{"url":"http://www.dianping.com/search/category/17/10/g3083r0","num":170},{"url":"http://www.dianping.com/search/category/17/10/g3087r0","num":129},{"url":"http://www.dianping.com/search/category/17/10/g3245r0","num":85},{"url":"http://www.dianping.com/search/category/17/10/g4389r0","num":150},{"url":"http://www.dianping.com/search/category/17/10/g4391r0","num":174},{"url":"http://www.dianping.com/search/category/17/10/g4393r0","num":66},{"url":"http://www.dianping.com/search/category/17/10/g4399r0","num":728},{"url":"http://www.dianping.com/search/category/17/10/g4401r0","num":149},{"url":"http://www.dianping.com/search/category/17/10/g796r123","num":237},{"url":"http://www.dianping.com/search/category/17/10/g796r124","num":100},{"url":"http://www.dianping.com/search/category/17/10/g796r125","num":121},{"url":"http://www.dianping.com/search/category/17/10/g796r126","num":214},{"url":"http://www.dianping.com/search/category/17/10/g796r127","num":87},{"url":"http://www.dianping.com/search/category/17/10/g796r129","num":94},{"url":"http://www.dianping.com/search/category/17/10/g796r467","num":40},{"url":"http://www.dianping.com/search/category/17/10/g796r5412","num":13},{"url":"http://www.dianping.com/search/category/17/10/g796r5413","num":10},{"url":"http://www.dianping.com/search/category/17/10/g796r5414","num":9},{"url":"http://www.dianping.com/search/category/17/10/g796r128","num":18},{"url":"http://www.dianping.com/search/category/17/10/g805r123","num":268},{"url":"http://www.dianping.com/search/category/17/10/g805r124","num":84},{"url":"http://www.dianping.com/search/category/17/10/g805r125","num":88},{"url":"http://www.dianping.com/search/category/17/10/g805r126","num":169},{"url":"http://www.dianping.com/search/category/17/10/g805r127","num":51},{"url":"http://www.dianping.com/search/category/17/10/g805r129","num":82},{"url":"http://www.dianping.com/search/category/17/10/g805r467","num":27},{"url":"http://www.dianping.com/search/category/17/10/g805r5412","num":11},{"url":"http://www.dianping.com/search/category/17/10/g805r5413","num":1},{"url":"http://www.dianping.com/search/category/17/10/g805r5414","num":5},{"url":"http://www.dianping.com/search/category/17/10/g805r128","num":7},{"url":"http://www.dianping.com/search/category/17/10/g795r123","num":400},{"url":"http://www.dianping.com/search/category/17/10/g795r124","num":112},{"url":"http://www.dianping.com/search/category/17/10/g795r125","num":160},{"url":"http://www.dianping.com/search/category/17/10/g795r126","num":243},{"url":"http://www.dianping.com/search/category/17/10/g795r127","num":72},{"url":"http://www.dianping.com/search/category/17/10/g795r129","num":110},{"url":"http://www.dianping.com/search/category/17/10/g795r467","num":36},{"url":"http://www.dianping.com/search/category/17/10/g795r5412","num":13},{"url":"http://www.dianping.com/search/category/17/10/g795r5413","num":3},{"url":"http://www.dianping.com/search/category/17/10/g795r5414","num":7},{"url":"http://www.dianping.com/search/category/17/10/g795r128","num":14}];
			var urls = [];
			var ITEMS_PERPAGE = 15;
			for( var i=0,l=idlist.length;i<l;i++){
				var idgroup = idlist[i],
					pages = Math.ceil(idgroup.num/ITEMS_PERPAGE);
				var url_prefix = idgroup.url+'p';
				for( var j =0;j<=pages;j++){
					var url = url_prefix + j;
					urls.push(url);
				}
			}
			return urls;
        }
    }
});

nop.launch();

//nop.all.reduce(function(memo,n){return memo.concat(n);},[]);