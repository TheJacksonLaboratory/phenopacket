import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PhenoCreatorComponent } from './pheno-creator.component';


describe('PhenoCreatorComponent', () => {
  let component: PhenoCreatorComponent;
  let fixture: ComponentFixture<PhenoCreatorComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PhenoCreatorComponent ],
      imports: [
        ReactiveFormsModule,
        FormsModule
      ],
      providers: [
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PhenoCreatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});