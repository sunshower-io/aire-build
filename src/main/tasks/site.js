const
    glob = require('glob'),
    pug = require('pug'),
    log = require('fancy-log'),
    merge = require('deepmerge'),
    fs = require('fs'),
    paths = require('../paths.js'),
    {locatePackage, locatePackageIn, parentDirectory} = require('./utils');
path = require('path');

//================================================================================
// end utils.js: todo make recursive
//================================================================================

const readSection = (c, component) => {
    let sectionFound = false;
    for (let i = c.length - 1; i >= 0; i--) {
        let cm = c[i];
        if (cm && cm.type && cm.type.startsWith('section.')) {
            let t = cm.type,
                secs = t.split('.'),
                name = secs[1],
                section = {
                    name: name
                };
            for (let j = c.length - 1; j >= 0; j--) {
                let cmp = c[j],
                    type = cmp.type;
                if (type.startsWith(name)) {
                    let portion = type.split('.');
                    if (portion.length > 2) {
                        let pname = portion[1],
                            nname = portion[2],
                            exs = section[pname] || [];
                        for (let k = c.length - 1; k >= 0; k--) {
                            let ck = c[k];
                            if (ck.type.endsWith(nname)) {
                                exs.push({
                                    name: nname.split('_').join(' '),
                                    html: ck.html,
                                    string: ck.string
                                });
                                c.splice(k, 1);
                            }
                        }
                        if (!section[pname]) {
                            section[pname] = exs;
                        }
                    } else {
                        let path = portion.slice(1).join('.');
                        section[path] = {
                            html: cmp.html,
                            string: cmp.string
                        };
                    }
                    c.splice(j, 1);
                }
            }
            sectionFound = true;
            component.sections.push(section);
            c.splice(i, 1);
        }
    }
    return [c, sectionFound];

};

const buildDocs = (component) => {
    let t = component.tags,
        section = null;
    component.sections = component.sections || [];

    let secfound = false;
    do {
        const [_, s] = readSection(t, component);
        secfound = s;
    } while (secfound);

};

const readComponent = (compdata, liftprops) => {
    if (compdata && compdata.length) {
        let merged = compdata.reduce((ac, d) => merge(ac, d), {}),
            component = merged,
            result = null;
        if (component.tags) {
            for (let t of component.tags) {
                if (t.type === 'component') {
                    result = component;
                }
            }
        }
        if (result) {
            buildDocs(result);
            if (result.tags) {
                for (let t of result.tags) {
                    if (t.type && liftprops.hasOwnProperty(t.type)) {
                        let transform = liftprops[t.type];
                        if (transform) {
                            component[t.type] = transform(t.string, component);
                        } else {
                            component[t.type] = t.string;
                        }

                    }
                }
            }
        }
        return result;
    }
};

const toProperties = props => {
    let result = {};
    for (let p of props) {
        if (typeof p === 'object') {
            for (let pr in p) {
                result[pr] = p[pr];
            }
        } else {
            result[p] = undefined;
        }
    }
    return result;
};


const writeComponent = (component) => {
    let pdir = `${process.cwd()}/${paths.output}/${component.directory}`;
    if (!fs.existsSync(pdir)) {
        fs.mkdirSync(pdir, {recursive: true});
    }
    let f = `${pdir}/${component.component}.comp`;

    fs.writeFileSync(
        f,
        JSON.stringify(component)
    );
};

const loadComponent = (direct, data, components, props) => {
    let contents = JSON.parse(data),
        compdata = readComponent(contents, props);
    if (compdata) {
        compdata.directory = direct;
        components.push(compdata);
        compileExamples(compdata);
        writeComponent(compdata);
    }
};

/**
 * aire:generate step 2
 */

const generateComponent = (file, components, props) => {
    let data = fs.readFileSync(file),
        segs = file.split(path.sep);
    segs.pop();
    loadComponent(segs.pop(), data, components, props)
};


const generateComponents = (files, components, properties) => {
    let props = toProperties(properties);
    for (let file of files) {
        generateComponent(file, components, props);
    }
};


const compileExamples = (component) => {
    for (let sec of component.sections) {
        if(sec.examples) {
            for (let ex of sec.examples) {
                let estr = ex.string.trim();
                ex.pug = estr;
                ex.html = pug.compile(estr)();
            }
        }
    }
};

/**
 * aire:generate step 1
 */
const locateAndGenerateComponents = (done) => {
    log.info("aire:generate(2): Resolving Aire...");
    let pkg = locatePackageIn(require(`${process.cwd()}/package.json`), 'aire'),
        realdir = fs.realpathSync(pkg);
    if (!pkg) {
        log.info("Package 'aire' could not be found");
    } else {
        let searchpath = `${realdir}/${paths.components}`,
            components = [],
            properties = [
                'name',
                'component',
                {'categories': (c) => c.split(/\s*,\s*/)}
            ];
        log.info(`Searching for components in: ${searchpath}`);
        generateComponents(glob.sync(searchpath), components, properties);
        log.info(`Successfully resolved ${components.length} components in Aire...generating site`);
        return components;
    }
};


toNavigationElement = el => {
    return {
        nav: true,
        title: el.component,
        route: el.component,
        settings: {
            component: el.component,
            category: el.categories,
            directory: el.directory
        },
        moduleId: 'aire-demo/lib/doc-page'
    }

};


generateNavigation = (components) => {
    let nav = components.map(t => toNavigationElement(t)),
        dir = `${paths.output}/route`;
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, {recursive: true});
    }
    try {
        fs.unlinkSync(`${dir}/route.comp`);
    } catch (e) {
    }
    fs.writeFileSync(`${dir}/route.comp`, JSON.stringify(nav, null, 2));
};


async function aireGenerate(done) {
    log.info("aire:generate(1): Beginning Aire site generation");
    let components = locateAndGenerateComponents(done);
    generateNavigation(components);
    log.info("aire:generate(1): Successfully generated site");
    done();
}

exports.readSection = readSection;
exports.aireGenerate = aireGenerate;

// module.exports = (gulp) => {
//     gulp.task('aire:generate', aireGenerate);
// };
exports.loadComponent = loadComponent;


