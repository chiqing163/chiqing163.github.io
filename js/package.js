(function(){function f(a){this.t=a}function k(a,b){for(var c=b.split(".");c.length;){if(!(c[0]in a))return!1;a=a[c.shift()]}return a}function d(a,b){return a.replace(h,function(c,a,e,f,i,h,l,j){var c=k(b,f),a="",g;if(!c)return"!"==e?d(i,b):l?d(j,b):"";if(!e)return d(l?h:i,b);if("@"==e){for(g in c)c.hasOwnProperty(g)&&(b._key=g,b._val=c[g],a+=d(i,b));delete b._key;delete b._val;return a}}).replace(j,function(a,d,e){return(a=k(b,e))||0===a?"%"==d?(new Option(a)).innerHTML.replace(/"/g,"&quot;"):a:""})}
var h=/\{\{(([@!]?)(.+?))\}\}(([\s\S]+?)(\{\{:\1\}\}([\s\S]+?))?)\{\{\/\1\}\}/g,j=/\{\{([=%])(.+?)\}\}/g;f.prototype.render=function(a){return d(this.t,a)};window.t=f})();

function SSSpider () {
    this.top = {
        paied: {index: 1, results: []},
        free: {index: 2, results: []},
        grossing: {index: 3, results: []}
    };
}

SSSpider.prototype = {
    fetch: function () {
        var me = this;
        $('table.top_apps tr:gt(0)').each(function (index, item) {
            var rank = $(item).find('.rank').html(); 
            var as = $(item).find('td');
            var dict = {};
            var group, td; 
            var top = me.top;
            var get_content = me.get_content;
            for (group in top) {
                dict[group] = as.eq(top[group].index);  
            }
            for (group in dict) {
                td = dict[group];
                top[group].results.push(me.get_content(td, index));  
            } 
        });
        return this;
    },
    get_content: function (td, rank) {
        var a = td.find('a'),
                url = a.attr('href'),
                name = a.html(),
                change = td.find('span').html();
        return { name: name, url: url, change: change, rank: rank }; 
    }
};

function DetailSpider () {
    this.task = null;
    //name, rating, ratings, imgs, publisher, price, initial
    this.oncomplete = null;
}

DetailSpider.prototype = {
    setup: function (option) {
        this.task = option.task;
        this.oncomplete = option.complete;
        return this;
    },
    raiseFinish: function () {
        this.oncomplete && this.oncomplete(this.task);
    },
    fetch: function () {
        var me = this;
        $.ajax({
            url: this.task.url,
            complete: function (data) {
                var html = data.responseText;
                me.craw({
                    html: html
                });
            }
        });
    },
    craw: function (option) {
        var html = option.html;
        var item = this.get_content(html);
        for ( var k in item ) {
            this.task[k] = item[k];
        }
        html = '';
        this.raiseFinish();
    },
    get_content: function (html) {
        var container = $(html);
        return { 
            imgs: $.map(container.find('#screenshots img'), function(n) { return n.src; }), 
            price: container.find('div.app h2>span').html(), 
            rating: container.find('div.app_detail_rating_total:last>strong').html(), 
            ratings: container.find('div.app_detail_rating_total:last>span.number').html(), 
            initial: container.find('#app_versions tr.even td.date').html(),
            publisher: container.find('div.app>h2>a').html(),
            publisherURL: container.find('div.app>h2>a').attr('href')
        };
    }
};

function DetailSpiderManager () {
    this.tasks = [];
    this.spiders = {};
    this.dones = [];
    this.listener = {};
}

DetailSpiderManager.prototype = {
    //name, url, change, rank
    setupTasks: function (tasks) {
        this.tasks = tasks;
        return this;
    },
    readTasks: function(top) {
        var query = this.getQuery(),
            start = parseInt(query.start, 10) || 0,
            length;
        query.group = query.group || 'mix';
        if (top[query.group]) {
            this.tasks = top[query.group].results;
        } else if (query.group === 'mix') {
            var mix = {};
            var ret = [];
            for (var name in top) {
                var group = top[name].results;
                for (var i = 0, item; item = group[i]; i++) {
                    if (!mix[item.name]) {
                        mix[item.name] = true;
                        ret.push(item);
                    }
                }
            }
            this.tasks = ret;
            console.log('mix')
        } else {
            this.tasks = top.grossing.results;
        }

        length = parseInt(query.length, 10) || 900;
        length = Math.min(length + start, this.tasks.length) - start;
        this.tasks = this.tasks.splice(start, length);

        return this;
    },
    getQuery: function () {
        var ret = {}, queryString = location.search.substring(1),
            re = /([^&=]+)=([^&]*)/g, m;
        while (m = re.exec(queryString)) {
            ret[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
        }
        return ret;
    },
    start: function () {
        var tasks = this.tasks,
                me = this;
        if (!tasks) return this.raiseFinish();
        
        for (var i = 0, l = tasks.length; i < l; i++) {
            var t = new DetailSpider();
            t.setup({
                  task: tasks[i],
                  complete: function (detail) {
                      me.dones.push(detail);
                        me.raiseSpideOne(0, detail);
                        me.checkFinished();
                }
             })
             .fetch();
        }
    },
    on: function (event, callback) {
        var callbacks = this.listener[event]; 
        if (!callbacks) {
            this.listener[event] = [];
            callbacks = this.listener[event];
        }
        callbacks.push(callback);
        return this;
    }, 
    checkFinished: function () {
        if(this.dones && this.dones.length === this.tasks.length) {
            this.raiseFinish();
        }
    },
    raiseSpideOne: function (index, item) {
        this.raise('spideone', [index, item]);
        return this;
    }, 
    raiseFinish: function () {
        this.raise('finish');
        return this;
    },
    raise: function (event, args) {
        var callbacks = this.listener[event];
        if (!callbacks) return this;
        
        for (var i = 0, l = callbacks.length; i < l; i++) {
            callbacks[i].apply(this, args);
        }
        return this;
    }
};

function TableRender () {
    this.container = null;
}

TableRender.prototype = {
    clearPage: function () {
        $('body')[0].innerHTML = '';
        this.container = $('<div style="padding:10px; background-color:#fff;"></div>');
        $('body').css('background', '#fff').append(this.container);
        document.title = document.location.href.replace('http://www.appannie.com/top/', '');
        return this;
    },
    append: function (one) {
    //name, rating, ratings, imgs, publisher, price, initial
        console.log(one);
        one.change = one.change.replace(/^\((.*)\)$/g, '$1');
        var template = new t('<p><a style="color:#333" href="{{=url}}" target="_blank">{{=rank}}({{=change}}). <span style="color:purple">{{=rating}}({{=ratings}})</span> '+
                            '<span style="color:red">{{=name}}</span> - {{=price}}</a>' + 
                            '<a style="color:blue; margin-left: 20px;" href="{{=publisherURL}}" target="_blank">{{=publisher}}, {{=initial}} </a>' + 
                            '<p style="white-space: nowrap">{{@imgs}}<img src="{{=_val}}"/>&nbsp;{{/@imgs}}</p>');
      var html = template.render(one);
        this.container.append(html);
        return this;
    }
};
function inherit(C, P) {
    C.prototype = new P();
}
function MobileRender () {
}
inherit(MobileRender, TableRender);
MobileRender.prototype.append = function (one) {
    console.log(one);
    one.change = one.change.replace(/^\((.*)\)$/g, '$1');
    var template = new t('<p><a style="color:#333" href="{{=url}}" target="_blank">{{=rank}}({{=change}}). <span style="color:purple">{{=rating}}({{=ratings}})</span><br/>'+
                        '<span style="color:red">{{=name}}</span> - {{=price}}<br>www.appannie.com{{=url}}</a><br>' + 
                        '<a style="color:blue;" href="{{=publisherURL}}" target="_blank">{{=publisher}}, {{=initial}} <br>{{=publisherURL}}</a>' + 
                        '<p style="white-space: nowrap">{{@imgs}}<img src="{{=_val}}"/><br/>{{/@imgs}}</p>');
    var html = template.render(one);
    this.container.append(html);
    return this;
};


var ss = new SSSpider();
var render = new MobileRender();
var manager = new DetailSpiderManager();

ss.fetch();
render.clearPage();
//manager.setupTasks(ss.top.grossing.results)
manager.readTasks(ss.top)
             .on('spideone', function (index, item) {
                    console.log(index);
                    render.append(item);
                })
             .on('finish', function () {
                    console.log('Done!');
                })
             .start();

