import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { trigger, state, style, transition, animate } from '@angular/animations';

import { FileService } from 'src/app/services/file.service';
import { File } from 'src/app/models/base';

import { MessageDialogComponent } from '../../shared/message-dialog/message-dialog.component';
import { SpinnerDialogComponent } from '../../shared/spinner-dialog/spinner-dialog.component';
import { Attribute } from './file-detail/file-detail.component';
import { DataPresentMatTableDataSource } from '../../shared/DataPresentMatTableDataSource';

@Component({
  selector: 'app-file',
  templateUrl: './file.component.html',
  styleUrls: ['./file.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed, void', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
      transition('expanded <=> void', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})
export class FileComponent implements OnInit {

  @Input()
  phenopacketFiles: File[] = [];
  @Output()
  onFilesChanged = new EventEmitter<File[]>();

  // Table items
  displayedColumns = ['uri', 'description', 'mapping', 'attribute', 'remove'];

  expandedElement: File | null;

  filesMap = new Map<string, File>();
  datasource = new DataPresentMatTableDataSource<File>();

  diseaseCount: number;
  // searchparams
  currSearchParams: any = {};

  dialogRef: any;
  spinnerDialogRef: any;


  constructor(public searchService: FileService, public dialog: MatDialog) { }

  ngOnInit(): void {
    if (this.phenopacketFiles) {
      this.phenopacketFiles.forEach((element, index) => {
        const id = `file-${index}`;
        element.id = id;
        this.filesMap.set(id, element);
      });
    }
    this.datasource.data = Array.from(this.filesMap.values());
  }

  addFile() {
    const newFile = new File('new/file/uri', 'new file description');
    const id = `file-${this.filesMap.size + 1}`;
    newFile.id = id;
    this.filesMap.set(id, newFile);
    this.updateFiles();
  }

  removeFile(element: File) {
    const msgData = { 'title': 'Remove File' };
    msgData['description'] = 'Remove file from list" ?';
    msgData['displayCancelButton'] = true;
    const dialogRef = this.dialog.open(MessageDialogComponent, {
      width: '400px',
      data: msgData
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'ok') {
        this.filesMap.delete(element.id);
        this.updateFiles();
      }
    });
    return dialogRef;
  }

  changeFile(file: File, element: File) {
    this.filesMap.set(element.id, file);
    // update files
    this.updateFiles();
  }

  openSpinnerDialog() {
    this.spinnerDialogRef = this.dialog.open(SpinnerDialogComponent, {
      panelClass: 'transparent',
      disableClose: true
    });
  }

  expandCollapse(element: any) {
    this.expandedElement = this.expandedElement === element ? null : element;

  }

  updateFiles() {
    const filesArray = Array.from(this.filesMap.values());
    this.datasource.data = filesArray;
    this.onFilesChanged.emit(filesArray);
  }

  getMappingKeys(file: File) {
    return file.individualToFileIdentifier.keys();
  }
  getMapping(file: File, key: string) {
    const value = file.individualToFileIdentifier.get(key);
    return `${key} -> ${value}`;
  }
  getAttributeKeys(file: File) {
    const resultKeys = [];
    // remove description key
    file.fileAttribute.forEach((value: string, key: string) => {
      if (key !== 'description') {
        resultKeys.push(key);
      }
    });
    return resultKeys;
  }
  getColor(key: string) {
    if (key === Attribute.Keys.FileFormat) {
      return 'primary';
    }
    if (key === Attribute.Keys.GenomeAssembly) {
      return 'accent';
    }
    return 'gray';
  }
  getAttribute(file: File, key: string) {
    return file.fileAttribute.get(key);
  }

}


