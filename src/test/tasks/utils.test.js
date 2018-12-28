
const
    dox = require('dox'),
    utils = require('main/tasks/utils.js'),
    site = require('main/tasks/site.js');



const testClass = `
/**
 *
 * this is a cool nav component
 *
 * what do you think?
 *
 * @component nav
 *
 * @section.usage
 *
 * @usage.title Usage
 * @usage.description
 *  This is a cool bean
 *  #whatever _whatever_
 *
 * @usage.examples.Hello_World
 *  aire-nav(router.bind="router")
 *
 * @usage.examples.OtherRouter
 *  aire-nav(router.bind="router")
 *
 *
 * @param {bindable} router (aurelia-router)
 * @param {bindable} normalizeTitle (f: NavModel => string)
 *
 * @param {pseudo} whatever
 */
@inject(EventAggregator, Element)
@customElement('aire-nav')
export class AireNav {

  @bindable
  private router: Router;

  @bindable
  normalizeTitle    : (n : NavModel) => string;

  ul: HTMLElement;

  constructor(readonly bus: EventAggregator, private element: Element) {

  }

  protected navigation() : NavModel[] {
    if (this.router) {
        let nav = this.router.navigation,
            current = new Map<string, NavModel>();
        for(let n of nav) {
            current.set(n.config.title, n);
        }
        return Array.from(current.values());
    } else {
      return [];
    }
  }

  fire() {
    this.bus.publish(Events.NavigationEvent.ITEM_CLICKED, {});
    return true;
  }


    attached() {
        dom.decorateTo(this.element, this.ul, "default", "uk-nav-default");
        dom.decorateTo(this.element, this.ul, "primary", "uk-nav-primary");
        dom.decorateTo(this.element, this.ul, "center", "uk-nav-center");
    }

}
`;
test('utils must read a section correctly', () => {
    expect(utils).toBeTruthy();
});

test('utils:readSection must read a section correctly when no sections exist', () => {
    site.readSection([], null);
});


test('utils:readsection must read a section correctly when a section exists', () => {
    let s = dox.parseComments(testClass),
        sjs = JSON.stringify(s),
        cmps = [];
    site.loadComponent('test', sjs, cmps, []);

    expect(cmps.length).toBe(1);
    expect(cmps[0].sections.length).toBe(1);
    let secs = cmps[0].sections[0];
    expect(secs.examples[1].name).toBe("Hello World");
});

test('utils:readSection', () => {


});