export function injectMediaRecorderMock() {
  // Лёгкий мок MediaRecorder: эмитим dataavailable каждые 100ms и останавливаемся по .stop()
  const script = `
  (() => {
    if (!("MediaRecorder" in window)) {
      class FakeRecorder {
        ondataavailable = null;
        onstop = null;
        onerror = null;
        state = "inactive";
        privateInterval = null;

        constructor(stream, opts) { this.stream = stream; this.opts = opts; }
        start() {
          this.state = "recording";
          this.privateInterval = setInterval(() => {
            const blob = new Blob([new Uint8Array([1,2,3,4])], { type: (this.opts?.mimeType || "audio/webm") });
            this.ondataavailable && this.ondataavailable({ data: blob });
          }, 100);
        }
        stop() {
          if (this.privateInterval) clearInterval(this.privateInterval);
          this.state = "inactive";
          this.onstop && this.onstop();
        }
      }
      // @ts-ignore
      window.MediaRecorder = FakeRecorder;
    }
    if (!navigator.mediaDevices) {
      // @ts-ignore
      navigator.mediaDevices = {};
    }
    if (!navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia = async () => new MediaStream();
    }
  })();
  `;
  return script;
}
