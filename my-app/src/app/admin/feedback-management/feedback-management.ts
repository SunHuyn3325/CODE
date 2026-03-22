import { Component, OnInit } from '@angular/core';
import { FeedbackApiService } from '../../feedback-api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-feedback-management',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './feedback-management.html',
  styleUrls: ['./feedback-management.css']
})
export class FeedbackManagement implements OnInit{

    filterReplied: string = 'all';
    filtered: any[] = [];

    applyFilter() {
      this.filtered = this.feedbacks.filter(f => {
        let matchStatus = true;
        if (this.filterReplied === 'replied') matchStatus = f.replied === true;
        if (this.filterReplied === 'notReplied') matchStatus = !f.replied;
        const text = this.searchText.toLowerCase();
        return matchStatus && (
          f.fullName.toLowerCase().includes(text) ||
          f.email.toLowerCase().includes(text) ||
          f.message.toLowerCase().includes(text)
        );
      });
    }
  // Đánh dấu đã phản hồi (chỉ cập nhật local, muốn lưu DB cần API)
  markReplied(f: any, event: any) {
    if (event.target.checked) {
      f.replied = true;
    }
  }

  feedbacks:any[] = [];

  searchText = '';

  constructor(private api:FeedbackApiService){}

  ngOnInit(){
    this.loadFeedback()
  }

  loadFeedback(){
    this.api.getFeedback().subscribe(res=>{
      this.feedbacks = res as any[];
      this.applyFilter();
    })
  }

  deleteFeedback(id:string){
    this.api.deleteFeedback(id).subscribe(()=>{
      this.loadFeedback()
    })
  }

  filteredFeedback(){
    // Nếu đã lọc thì trả về filtered, nếu chưa thì trả về tất cả
    return this.filtered.length > 0 || this.searchText || this.filterReplied !== 'all' ? this.filtered : this.feedbacks;
  }

}