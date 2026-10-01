export interface ApiBody {
  responseCode: number;
  message?: string;
}

export interface ApiMessageResponse extends ApiBody {
  message: string;
}

export interface ApiProduct {
  id: number;
  name: string;
  price: string;
  brand: string;
  category: {
    category: string;
    usertype: {
      usertype: string;
    };
  };
}

export interface ProductsListResponse extends ApiBody {
  products: ApiProduct[];
}

export interface ProductSearchResponse extends ApiBody {
  products: ApiProduct[];
}

export interface ApiBrand {
  id: number;
  brand: string;
}

export interface BrandsListResponse extends ApiBody {
  brands: ApiBrand[];
}
