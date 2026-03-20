import { Component, OnInit, HostListener } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-collection',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './collection.html',
  styleUrl: './collection.css',
})
export class Collection implements OnInit {
  collectionTitle: string = '';
  album: string[] = [];


  private data: any = {
    'kim-chi-ngoc-diep': {
      title: 'Kim Chi Ngọc Diệp',
      images: [
        'assets/kimchingocdiep1.png',
        'assets/kimchingocdiep2.png',
        'assets/kimchingocdiep3.png',
        'assets/kimchingocdiep4.png'
      ]
    },
    'nhuoc-cam-phu-hoa': {
      title: 'Nhược Cầm Phù Hoa',
      images: [
        'assets/nhuoccamphuhoa1.png',
        'assets/nhuoccamphuhoa2.png',
        'assets/nhuoccamphuhoa3.png',
        'assets/nhuoccamphuhoa4.png'
      ]
    },
    'thuy-tuc-uyen-tam': {
      title: 'Thuỷ Túc Uyên Tầm',
      images: [
        'assets/thuytucuyentam1.png',
        'assets/thuytucuyentam2.png',
        'assets/thuytucuyentam3.png',
        'assets/thuytucuyentam4.png'
      ]
    },
    'y-hien': {
      title: 'Ý Hiên',
      images: [
        'assets/yhien1.png',
        'assets/yhien2.png',
        'assets/yhien3.png',
        'assets/yhien4.png'
      ]
    }
  };


  constructor(private route: ActivatedRoute) {}


  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = params['id'] || params['collectionName'];
      if (this.data[id]) {
        this.collectionTitle = this.data[id].title;
        this.album = this.data[id].images;
      }
    });
  }


  @HostListener('window:scroll', ['$event'])
  onWindowScroll(_event: any) {
    const sections = document.querySelectorAll('.parallax-section');
    sections.forEach((section: any) => {
      const bg = section.querySelector('.parallax-bg');
      if (bg) {
        const speed = 0.4;
        const rect = section.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          const shift = rect.top * speed;
          bg.style.transform = `translateY(${shift}px)`;
        }
      }
    });
  }
}

