import Embla from 'embla-carousel';
import { isString, isEmpty, findOne, findAll, toJSON, attr, bind, fill, html } from '@tmbr/utils';

class Carousel {

  constructor(el, options = {}) {

    bind(this, ['select']);
    this.el = el;

    const {
      node = Carousel.options.node ?? '[data-carousel-node]',
      dots = Carousel.options.dots ?? '[data-carousel-dots]',
      prev = Carousel.options.prev ?? '[data-carousel-prev]',
      next = Carousel.options.next ?? '[data-carousel-next]',
      ...passed
    } = options;

    this.embla = new Embla(this.#find(node) || el.firstElementChild, {
      ...Carousel.options,
      ...passed,
      ...toJSON(el.dataset.carousel)
    }, Carousel.plugins);

    this.#init({
      dots: this.#find(dots),
      prev: this.#find(prev),
      next: this.#find(next),
    });

    return new Proxy(this, {
      get: (self, key) => self[key] ?? self.embla[key]
    });
  }

  get index() {
    return this.embla.selectedScrollSnap();
  }

  get slides() {
    return this.embla.slideNodes();
  }

  #init({dots, prev, next}) {

    const length = this.slides.length;
    attr(this.embla.rootNode(), 'aria-label', `Carousel, ${length} slides`);

    this.dots = isEmpty(dots) ? [] : dots.children.length
      ? findAll('button', dots)
      : fill(length, i => dots.appendChild(html`<button type="button" aria-label="Slide ${i + 1} of ${length}"></button>`));

    this.dots.forEach((dot, i) => {
      dot.addEventListener('click', () => this.embla.scrollTo(i));
    });

    if (prev) {
      this.prev = prev;
      this.prev.addEventListener('click', this.embla.scrollPrev);
      attr(prev, 'aria-label', 'Previous Slide');
    }

    if (next) {
      this.next = next;
      this.next.addEventListener('click', this.embla.scrollNext);
      attr(next, 'aria-label', 'Next Slide');
    }

    this.embla.on('select', this.select);
    this.select();
  }

  #find(el) {
    return isString(el) ? findOne(el, this.el) : el;
  }

  select() {
    const current = this.index;
    this.dots.forEach((dot, i) => attr(dot, 'aria-current', i === current ? 'true' : false));
    this.prev && attr(this.prev, 'aria-disabled', this.embla.canScrollPrev() ? false : 'true');
    this.next && attr(this.next, 'aria-disabled', this.embla.canScrollNext() ? false : 'true');
  }

}

Carousel.options = {
  // https://www.embla-carousel.com/api/options/
};

Carousel.plugins = [
  // https://www.embla-carousel.com/plugins/
];

export default Carousel;
