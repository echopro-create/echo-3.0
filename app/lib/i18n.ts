export type Lang = "ru"; // оставим точку расширения

const dict = {
  ru: {
    record: "Записать",
    stop: "Остановить",
    reset: "Сбросить",
    upload: "Загрузить",
    cancelUpload: "Отменить загрузку",
    recording: "Идёт запись…",
    uploading: "Загрузка…",
    ready: "Готово. Файл сохранён.",
    stopped: "Запись остановлена. Можно прослушать и загрузить.",
    canceled: "Загрузка отменена.",
    error: "Ошибка",
    browserNoSupportAudio: "Ваш браузер не поддерживает MediaRecorder.",
    browserNoSupportVideo: "Ваш браузер не поддерживает MediaRecorder или getUserMedia.",
    limit: "Лимит",
    defaultFormat: "формат по умолчанию",
  },
} as const;

export function useT(lang: Lang = "ru") {
  return dict[lang];
}
