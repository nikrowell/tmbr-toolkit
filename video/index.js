import Component from '@tmbr/component';
import { bind, clamp, once, prop } from '@tmbr/utils';

function format(seconds) {
  const h = Math.floor( seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor( seconds % 60).toString().padStart(2, '0');
  return h > 0 ? `${h}:${m.toString().padStart(2, '0')}:${s}` : `${m}:${s}`;
}

export default class Video extends Component {

  constructor(el, options = {}) {
    super(el);

    const video = this.findOne('video');
    if (!video) return;

    bind(this);
    this.skip = options.skip ?? 5;

    this.dom.video = video;
    this.dom.time = this.findOne('[data-video-time]');
    this.dom.duration = this.findOne('[data-video-duration]');
    this.dom.progress = this.findOne('[data-video-progress]');
    this.dom.volume = this.findOne('[data-video-volume]');

    once('loadedmetadata', video, () => {
      this.dom.duration && (this.dom.duration.textContent = format(video.duration));
      this.dom.volume   && (this.dom.volume.value = this.volume);
    });

    prop(this.el, '--video-progress', 0);
    this.on('timeupdate', video, this.onTimeUpdate);
    this.on('volumechange', video, this.onVolumeChange);

    this.on('click', video, this.toggle);
    this.on('click', '[data-video-toggle]', this.toggle);
    this.on('input', '[data-video-volume]', this.onVolumeInput);
    this.on('click', '[data-video-mute]', () => this.muted = !this.muted);
    this.on('click', '[data-video-skip]', this.onSkipClick);
    this.on('click', '[data-video-progress]', this.onProgressClick);
    this.on('keydown', this.el, this.onKeyDown);
  }

  get paused() {
    return this.dom.video.paused;
  }

  get muted() {
    return this.dom.video.muted;
  }

  set muted(value) {
    this.dom.video.muted = value;
  }

  get volume() {
    return this.muted ? 0 : this.dom.video.volume;
  }

  set volume(value) {
    this.dom.video.volume = value;
  }

  get progress() {
    const { currentTime, duration } = this.dom.video;
    return duration ? currentTime / duration : 0;
  }

  toggle() {
    const method = this.paused ? 'play' : 'pause';
    this.dom.video[method]();
  }

  onTimeUpdate() {
    const { currentTime, duration } = this.dom.video;
    prop(this.el, '--video-progress', currentTime / duration);
    this.dom.time && (this.dom.time.textContent = format(currentTime));
  }

  onVolumeInput(event) {
    this.dom.video.volume = parseFloat(event.target.value);
    this.dom.video.muted = false;
  }

  onVolumeChange() {
    const volume = this.volume;
    prop(this.el, '--video-volume', volume);
    this.dom.volume && (this.dom.volume.value = this.volume);
  }

  onSkipClick(event) {
    const amount = parseFloat(event.target.dataset.videoSkip);
    if (isNaN(amount)) return;
    this.dom.video.currentTime = this.dom.video.currentTime + amount;
  }

  onProgressClick(event) {
    const rect = this.dom.progress.getBoundingClientRect();
    const percent = clamp((event.clientX - rect.left) / rect.width);
    this.dom.video.currentTime = percent * this.dom.video.duration;
  }

  onKeyDown(event) {
    if (!this.el.contains(document.activeElement)) return;

    switch (event.key) {

      case ' ':
        event.preventDefault();
        this.toggle();
        break;

      case 'ArrowLeft':
        event.preventDefault();
        this.dom.video.currentTime = this.dom.video.currentTime - this.skip;
        break;

      case 'ArrowRight':
        event.preventDefault();
        this.dom.video.currentTime = this.dom.video.currentTime + this.skip;
        break;
    }
  }
}
