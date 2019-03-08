import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as moment from 'moment';

/*
  Generated class for the DateFunctionServiceProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class DateFunctionServiceProvider {

  constructor(public http: HttpClient) {
  }

  dateToPrettyDate(dateString){
    return moment(dateString).format("DD/MM/YYYY");
    // return date.getDate() + "/" + date.getMonth() + "/" + date.getFullYear();
  }


  timeTo12Hour(time) {
    return moment(time, 'hh:mm').format("h:mma");
  }


  getMinMonth(events){
    let minMonth = moment();
    for(let i=0; i<events.length; i++){
      let eventDate = moment(events[i].startTime);
      if(eventDate.isBefore(minMonth)){
        minMonth = eventDate;
      }
    }
    return minMonth;
  }


  getOTCDate(date){
    if(typeof date === 'string'){
      date = new Date(date);
    }
    return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  }

  formatForCalendar(event){
    let dateTracked = new Date();
    dateTracked.setHours(0,0,0,0);
    let nextDay = moment(dateTracked).add(1, "day").toDate();
    event['startTime'] = this.getOTCDate(dateTracked);
    event['endTime'] =this.getOTCDate(nextDay);
    event['allDay'] = true;
    event['title'] = (event['Symptoms'] && event['Symptoms']['Migraine today']) ? 'Migraine' : 'No Migraine';
    return event;
  }


}
