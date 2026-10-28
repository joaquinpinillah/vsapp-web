/* Interacciones de la web vSApp (menú desplegable, selector de módulos).
   Cada página define su clase Component con el estado y los valores; este archivo los aplica al HTML:
   data-if="x" muestra u oculta, data-bind-<atributo>="x" asigna un atributo y data-on-click="x" ejecuta una acción. */
(function () {
  class DCLogic {
    constructor(props) { this.props = props || {}; this.state = {}; }
    setState(patch) { Object.assign(this.state, patch); if (this.__render) this.__render(); }
  }
  const get = (obj, path) => path.split('.').reduce((acc, key) => (acc == null ? acc : acc[key]), obj);
  window.DCLogic = DCLogic;
  window.vsappMount = function (Component) {
    const comp = new Component({});
    const ifs = Array.from(document.querySelectorAll('[data-if]'));
    const binds = [];
    document.querySelectorAll('*').forEach((el) => {
      for (const at of Array.from(el.attributes)) {
        if (at.name.startsWith('data-bind-')) binds.push([el, at.name.slice(10), at.value]);
      }
    });
    const clicks = Array.from(document.querySelectorAll('[data-on-click]'));
    let vals = {};
    clicks.forEach((el) => el.addEventListener('click', (ev) => {
      const fn = get(vals, el.dataset.onClick);
      if (typeof fn === 'function') fn(ev);
    }));
    comp.__render = () => {
      vals = comp.renderVals() || {};
      ifs.forEach((el) => { el.hidden = !get(vals, el.dataset.if); });
      binds.forEach(([el, name, path]) => {
        const v = get(vals, path);
        if (v == null) el.removeAttribute(name); else el.setAttribute(name, String(v));
      });
    };
    comp.__render();
  };
})();
