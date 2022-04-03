import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {TaskBoardComponent} from './task-board/task-board.component';
import {TaskComponent} from './task/task.component';
import {LoginComponent} from './login/login.component';
import {HTTP_INTERCEPTORS, HttpClientModule} from "@angular/common/http";
import {TokenInterceptorService} from "../services/token-interceptor.service";
import {ApiService} from "../services/api.service";
import {RouterModule} from "@angular/router";
import {DashboardComponent} from './dashboard/dashboard.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatDialogModule} from '@angular/material/dialog';
import {AuthService} from "../services/auth.service";
import {DragDropModule} from "@angular/cdk/drag-drop";
import {MatButtonModule} from "@angular/material/button";
import {MatMenuModule} from "@angular/material/menu";
import {CommonModule, HashLocationStrategy, LocationStrategy} from "@angular/common";
import {FormsModule} from "@angular/forms";
import { TimelinetasksComponent } from './timelinetasks/timelinetasks.component';
import { LogsComponent } from './logs/logs.component';
import { RichTextEditorAllModule } from '@syncfusion/ej2-angular-richtexteditor';
import { ExitbuttonComponent } from './elements/exitbutton/exitbutton.component';
import { ButtonCpComponent } from './elements/button-cp/button-cp.component';
import { IdeasComponent } from './ideas/ideas.component';
import { ButtonCp2Component } from './elements/button-cp2/button-cp2.component';
import { NotfoundComponent } from './elements/notfound/notfound.component';
import { ProgressBarComponent } from './elements/progress-bar/progress-bar.component';
import { MenuComponent } from './elements/menu/menu.component';

@NgModule({
  declarations: [
    AppComponent,
    TaskBoardComponent,
    TaskComponent,
    LoginComponent,
    DashboardComponent,
    TimelinetasksComponent,
    LogsComponent,
    ExitbuttonComponent,
    ButtonCpComponent,
    IdeasComponent,
    ButtonCp2Component,
    NotfoundComponent,
    ProgressBarComponent,
    MenuComponent
  ],
  imports: [
    RichTextEditorAllModule,
    BrowserModule,
    AppRoutingModule,
    RouterModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatDialogModule,
    DragDropModule,
    MatButtonModule,
    MatMenuModule,
    CommonModule,
    FormsModule
  ],
  providers: [
    AuthService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptorService,
      multi: true
    }, ApiService,
    {provide: LocationStrategy, useClass: HashLocationStrategy}
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}