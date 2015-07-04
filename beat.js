var fis = module.exports = require('fis');

fis.cli.name = 'beat';
fis.cli.info = fis.util.readJSON(__dirname + '/package.json');

// Require `beat-*` first, not `fis-*`.
fis.require.prefixes.unshift('beat');

fis.config.merge({

    statics: '/static'

    , templates: '/template'

    , namespace: ''

    , server: {
        rewrite: true,
        libs: 'pc',
        type: 'php',
        clean: {
            exclude: "fisdata**,smarty**,rewrite**,index.php**,WEB-INF**"
        }
    }

    , modules : {
        parser : {
            less : 'less',
            tmpl: 'bdtmpl',
            po: 'po'
        }

        , preprocessor: {
            tpl: 'components, extlang',
            html: 'components',
            js: 'components',
            css: 'components'
        }

        , postprocessor: {
            tpl: 'require-async',
            js: 'jswrapper, require-async'
        }

        , optimizer : {
            tpl : 'smarty-xss,html-compress'
        }

        , prepackager: 'widget-inline'
    }

    , roadmap : {

        ext : {
            less : 'css',
            tmpl : 'js',
            po   : 'json'
        }

    }

    , settings : {

        parser : {
            bdtmpl : {
                LEFT_DELIMITER : '<#',
                RIGHT_DELIMITER : '#>'
            }
        }

        , postprocessor : {
            jswrapper: {
                type: 'amd'
            }
        }

        , optimizer : {
            'uglify-js' : {
                output : {
                    /** 
                     * If line length of inlined js in smarty template is too large，
                     * an error may occur when template is being parsed. 
                     */
                    max_line_len : 500
                }
            }

            , 'png-compressor': {
                // default compress to max extend
                type: 'pngquant'
            }
        }
    }

    , component: {

        protocol: 'github'

        , gitlab: {
            author: 'fis-components'
        }

        , skipRoadmapCheck: true
    }

});

var defaultRoadmapPath = [

    {
        reg: /^\/components\/(.*\.(js|css))$/i,
        isMod: true,
        release: '${statics}/${namespace}/components/$1'
    }

    , {
        reg : /^\/widget\/(.*\.tpl)$/i,
        isMod : true,
        url : '${namespace}/widget/$1',
        release : '${templates}/${namespace}/widget/$1'
    }

    , {
        reg : /^\/widget\/(.*\.(js|css))$/i,
        isMod : true,
        release : '${statics}/${namespace}/widget/$1'
    }

    , {
        reg : /^\/page\/(.+\.(?:tpl|html))$/i,
        isMod: true,
        release : '${templates}/${namespace}/page/$1',
        extras: {
            isPage: true
        }
    }

    , {
        reg : /\.tmpl$/i,
        release : false,
        useOptimizer: false
    }

    , {
        reg: /^\/(static)\/(.*)/i,
        release: '${statics}/${namespace}/$2'
    }

    , {
        reg: /^\/(config|test)\/(.*\.json$)/i,
        isMod: false,
        charset: 'utf8',
        release: '/$1/${namespace}/$2'
    }

    , {
        reg: /^\/(config|test)\/(.*)/i,
        isMod: false,
        release: '/$1/${namespace}/$2'
    }

    , {
        reg : /^\/(plugin|smarty\.conf$)|\.php$/i
    }

    , {
        reg : 'server.conf',
        release : '/server-conf/${namespace}.conf'
    }

    , {
        reg: "domain.conf",
        release: '/config/$&'
    }

    , {
        reg: "build.sh",
        release: false
    }

    , {
        reg : '${namespace}-map.json',
        release : '/config/${namespace}-map.json'
    }

    , {
        reg: /^.+$/,
        release: '${statics}/${namespace}$&'
    }

];

fis.emitter.on('fis-conf:loaded', function () {
    // postpackager {{{

    var postpackager = fis.config.get('modules.postpackager', []);

    if (fis.util.is(postpackager, 'String')) {
        postpackager = postpackager.split(',');
    } else if (fis.util.is(postpackager, 'Function')) {
        postpackager = [postpackager];
    }

    var argv = process.argv;
    var isPreview = !(~argv.indexOf('-d') || ~argv.indexOf('--dest'));
    // auto generate smarty.conf
    if (isPreview) {
        postpackager.push(require('./lib/smarty-config.js'));
    }

    postpackager.push(require('./lib/livereload-target.js'));

    fis.config.set('modules.postpackager', postpackager);

    // }}}


    
    /**
     * Make sure customized roadmap.path config 
     * in fis-conf.js valid and be higher priority
     */
    var roadmapPath = fis.config.get('roadmap.path') || [];
    roadmapPath = roadmapPath.concat(defaultRoadmapPath);
    fis.config.set('roadmap.path', roadmapPath);

});

fis.emitter.on('after-beat-release', function () {

    fis.util.copy(
        __dirname + '/assets/index.php'
        , fis.project.getTempPath('www') + '/index.php'
    );

});
