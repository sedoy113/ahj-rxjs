import { of, interval } from 'rxjs';
import { ajax } from 'rxjs/ajax';
import { map, catchError, switchMap } from 'rxjs/operators';

export default class Messages {
  constructor(element) {
    this.parentElement = element;
    this.messagesElement = this.parentElement.querySelector('.messages_list');
    this.counterElement = this.parentElement.querySelector('.messages_counter');
    this.url = 'https://ahj-rxjs-heroku.herokuapp.com';

    this.parentElement.querySelector('.messages_clear').addEventListener('click', () => this.clearData());
  }

  init() {
    const data$ = interval(5000).pipe(
      switchMap(() => ajax(`${this.url}/messages/unread`).pipe(
        map((userResponse) => userResponse.response),
        catchError(() => of({ timestamp: Date.now(), messages: [] })),
      )),
    );
    data$.subscribe((result) => {
      const resultData = result || { timestamp: Date.now(), messages: [] };
      this.addHeader(resultData);
      for (const message of resultData.messages) {
        this.addMessage(this.formatData(message));
      }
    });
  }

  clearData() {
    this.messagesElement.innerHTML = '';
  }

  // eslint-disable-next-line
  formatData(data) {
    const messageElement = document.createElement('li');
    messageElement.classList.add('messages_item');
    const emailElement = document.createElement('div');
    emailElement.classList.add('messages_email');
    emailElement.innerText = data.from;
    const subjectElement = document.createElement('div');
    subjectElement.classList.add('messages_subject');
    if (data.subject.length > 15) {
      subjectElement.innerText = `${data.subject.substr(0, 15).trim()}...`;
    } else {
      subjectElement.innerText = data.subject;
    }
    const dataElement = document.createElement('div');
    dataElement.classList.add('messages_date');
    const dateFormat = new Date(data.received);
    const dateOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };
    const timeOptions = { minute: '2-digit', hour: '2-digit' };
    dataElement.innerText = `${dateFormat.toLocaleString('ru-RU', timeOptions)} ${dateFormat.toLocaleString('ru-RU', dateOptions)}`;
    messageElement.append(emailElement, subjectElement, dataElement);
    return messageElement;
  }

  addHeader(data) {
    const dateFormat = new Date(data.timestamp);
    const timeOptions = { minute: '2-digit', hour: '2-digit', second: '2-digit' };
    this.counterElement.querySelector('.messages_counter_date').innerText = dateFormat.toLocaleString('ru-RU', timeOptions);
    this.counterElement.querySelector('.messages_counter_num').innerText = data.messages.length;
  }

  addMessage(message) {
    this.messagesElement.prepend(message);
  }
}
