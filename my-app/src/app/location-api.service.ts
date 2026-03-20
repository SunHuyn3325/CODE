import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, shareReplay } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LocationApiService {
  private baseUrl = 'https://provinces.open-api.vn/api/v1/?depth=3';
  private locations$: Observable<any[]> | null = null; // khởi tạo lazy

  constructor(private http: HttpClient) {}

  private getLocations(): Observable<any[]> {
    if (!this.locations$) {
      // chỉ tạo khi chưa có
      this.locations$ = this.http.get<any[]>(this.baseUrl).pipe(
        shareReplay(1)
      );
    }
    return this.locations$;
  }

  getAllLocations(): Observable<any[]> {
    return this.getLocations();
  }

  getProvinces(): Observable<any[]> {
    return this.getLocations();
  }

  getDistricts(provinceCode: number): Observable<any[]> {
    return this.getLocations().pipe(
      map(provinces => {
        const province = provinces.find(p => p.code === provinceCode);
        return province ? province.districts : [];
      })
    );
  }

  getWards(districtCode: number): Observable<any[]> {
    return this.getLocations().pipe(
      map(provinces => {
        for (let p of provinces) {
          const district = p.districts.find((d: any) => d.code === districtCode);
          if (district) {
            return district.wards;
          }
        }
        return [];
      })
    );
  }
}