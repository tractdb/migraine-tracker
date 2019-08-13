import { Component, ViewChild } from '@angular/core';
import {Events, ModalController, Nav, Platform} from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { ErrorHandler, NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { HomePage } from '../pages/home/home';
import {GoalModificationPage} from "../pages/goal-modification/goal-modification";
import {TrackingModificationPage} from "../pages/tracking-modification/tracking-modification";
import {CouchDbServiceProvider} from "../providers/couch-db-service/couch-db-service";
import {FaqPage} from "../pages/faq/faq";
import {DataSummaryPage} from "../pages/data-summary/data-summary";
import {DataCalendarPage} from "../pages/data-calendar/data-calendar";
import {BreakFromTrackingPage} from "../pages/break-from-tracking/break-from-tracking";
import {DataVisPage} from "../pages/data-vis/data-vis";

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any = HomePage;

  pages: Array<{title: string, component: any}>;

  constructor(public platform: Platform, public statusBar: StatusBar, public splashScreen: SplashScreen,
              private couchDBService: CouchDbServiceProvider,
              public events: Events) {

    events.subscribe('configSeen', () => {
      this.pages = [
        { title: 'Home', component: HomePage},
        { title: 'About Migraine', component: FaqPage},
        { title: 'Data Summary', component: DataSummaryPage},
        { title: 'Data Calendar', component: DataCalendarPage},
        { title: 'Data Visualizations', component: DataVisPage},
        { title: 'Goals', component: GoalModificationPage},
        { title: 'Tracking Routine', component: TrackingModificationPage},
        { title: 'Take a Break from Tracking', component: BreakFromTrackingPage},
      ];
    });

    this.initializeApp();

    // used for an example of ngFor and navigation
    if(this.couchDBService.getActiveGoals() === null){
      this.pages = [
        { title: 'Home', component: HomePage},
        { title: 'About Migraine', component: FaqPage}
      ];
    }
    else{
      this.pages = [
        { title: 'Home', component: HomePage},
        { title: 'About Migraine', component: FaqPage},
        { title: 'Data Summary', component: DataSummaryPage},
        { title: 'Data Calendar', component: DataCalendarPage},
        { title: 'Data Visualizations', component: DataVisPage},
        { title: 'Goals', component: GoalModificationPage},
        { title: 'Tracking Routine', component: TrackingModificationPage},
        { title: 'Take a Break from Tracking', component: BreakFromTrackingPage},
      ];
    }

  }



  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.nav.setRoot(page.component);
  }
}
