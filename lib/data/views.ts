import { products as rawProducts } from "./products"
import { designers as rawDesigners } from "./designers"
import { toProductView, toDesignerView } from "./mappers"

export const products = rawProducts.map(toProductView)
export const designers = rawDesigners.map(toDesignerView)
