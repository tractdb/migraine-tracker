import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as moment from 'moment';


@Injectable()
export class DateFunctionServiceProvider {

  constructor(public http: HttpClient) {
  }

  compareTimes(time1, time2){
    var beginningTime = moment(time1, 'ha');
    var endTime = moment(time2, 'ha');
    return beginningTime.isBefore(endTime);
  }

  dateToPrettyDate(dateString, utc=false){
    let date = moment(dateString);
    if(utc){
      date = date.utc()
    }
    return date.format("MM/DD/YYYY");
    // return date.getDate() + "/" + date.getMonth() + "/" + date.getFullYear();
  }

  getMonthAgo(date){
    return moment(date).subtract(1, 'month');
  }

  getTime(time){
    return moment(time, 'hh:mm');
  }


  getDate(date){
    return moment(date);
  }

  compareToToday(date, granularity){
    return moment().isSame(date, granularity)
  }



  dateArithmatic(date, manipulation, amount, unit){
    if(manipulation === 'add'){
      return moment(date).add(amount, unit);
    }
    else{
      return moment(date).subtract(amount, unit);
    }
  }




  getDayOfWeek(date){
    return moment(date).format('ddd');
  }

  timeTo12Hour(time) {
    return moment(time, 'hh:mm').format("h:mma");
  }

  milisecondsToTime(durationInMS){
    let duration = moment.duration(durationInMS);
    let hours = duration.hours();
    let minutes = duration.minutes();
    if(hours > 0){
      return hours + " hr" + (hours>1? 's' : '') +  ", " + minutes + " min" + (minutes>1? 's' : '');
    }
    return minutes + " min" + (minutes>1? 's' : '');
  }

  getISOTime(timeString){
    return moment.utc(timeString, 'hh:mma').toISOString();
  }

  dateGreaterOrEqual(d1, d2){
    return moment(d1) >= moment(d2);
  }


  milisecondsToPrettyTime(durationInMS){
    let duration = moment.duration(durationInMS);
    let hours = duration.hours();
    let minutes = duration.minutes();
    return hours + " hour" + (hours>1? 's' : '') +  ", " + minutes + " minute" + (minutes>1? 's' : '');
  }

  getDuration(time1, time2){
    let t1 = moment(time1, 'hh:mm');
    let t2 = moment(time2, 'hh:mm');
    if(t2.isBefore(t1)){ //TODO: bad assumption :(
      t2 = t2.add(1, "day");
    }
    return t2.diff(t1);
  }





  getUTCDate(date){
    // is sometimes the wrong date?
    if(!date) date = new Date();
    if(typeof date === 'string'){
      date = new Date(date);
    }
    date.setHours(0,0,0,0);
    return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  }


  getStartAndEndDatesForCalendar(date=null){
    let dateTracked = date ? new Date(date) : new Date();
    let startDate = new Date(Date.UTC(dateTracked.getFullYear(), dateTracked.getMonth(), dateTracked.getDate()));
    dateTracked.setHours(0,0,0,0);
    let nextDay = moment(dateTracked).add(1, "day").toDate();
    let endDate = new Date(Date.UTC(nextDay.getFullYear(), nextDay.getMonth(), nextDay.getDate()));
    return [startDate, endDate]
  }




}
