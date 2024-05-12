import {Component, OnInit} from '@angular/core';
import {ProductService} from "../services/product.service";
import {Product} from "../model/product.model";
import {Router} from "@angular/router";
import {AppStateService} from "../services/app-state.service";

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit{

  constructor(private productService:ProductService,
              private router : Router , public appState : AppStateService) { }

  ngOnInit() { this.searchProducts(); }

  searchProducts(){
    this.productService.searchProducts(
      this.appState.productsState.keyword,
      this.appState.productsState.currentPage,
      this.appState.productsState.pageSize)
      .subscribe({
        next : (resp) => {
          let products=resp.body as Product[];
          let totalProducts:number=parseInt(resp.headers.get('x-total-count')!);
          let totalPages=
            Math.floor(totalProducts / this.appState.productsState.pageSize);
          if(totalProducts % this.appState.productsState.pageSize !=0 ){
            ++totalPages;
          }
          this.appState.setProductState({
            products :products,
            totalProducts : totalProducts,
            totalPages : totalPages,
            status :"LOADED"
          })
        },
        error : err => {
          this.appState.setProductState({
            status : "ERROR",
            errorMessage :err
          })
        }
      })
  }

  handleCheckProduct(product: Product) {
    this.productService.checkProduct(product).subscribe({
      next :updatedProduct => {
        product.checked=!product.checked;
      }
    })
  }

  handleDelete(product: Product) {
    if(confirm("Are you sure to delete this product?"))
      this.productService.deleteProduct(product).subscribe({
        next:value => {
          this.searchProducts();
        }
      })
  }

  handleGotoPage(page: number) {
    this.appState.productsState.currentPage=page;
    this.searchProducts();
  }

  handleEdit(product: Product) {
    this.router.navigateByUrl(`/admin/editProduct/${product.id}`)
  }
}
