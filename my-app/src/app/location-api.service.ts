import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LocationApiService {
  private baseUrl = 'https://provinces.open-api.vn/api/v1/?depth=3';
  constructor(private http: HttpClient) {}
    getAllLocations(): Observable<any[]> {
      return this.http.get<any[]>(this.baseUrl);
    }

    getProvinces(): Observable<any[]> {
      return this.getAllLocations().pipe(
        map(data => data)
      );
    }

    getDistricts(provinceCode: number): Observable<any[]> {
      return this.getAllLocations().pipe(
        map(provinces => {
          const province = provinces.find(p => p.code === provinceCode);
          return province ? province.districts : [];
        })
      );
    }

    getWards(districtCode: number): Observable<any[]> {
      return this.getAllLocations().pipe(
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
