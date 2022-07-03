import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { toast } from "react-toastify";
import { api } from "../services/api";
import { Product, Stock } from "../types";

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem("@RocketShoes:cart");

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    api.get("products").then((response) => setProducts(response.data));
  }, []);

  const addProduct = async (productId: number) => {
    try {
      const isAlreadyAnyDataInCard = cart.length > 0 ? true : false;

      const comparisonOfProductAndCard = products.filter((product) =>
        product.id === productId ? product : null
      ); // aqui está o produto do carrinho

      const alreadyInCart = cart.find((productCart) =>
        productCart.id === comparisonOfProductAndCard[0].id ? true : false
      );

      if (!alreadyInCart) {
        comparisonOfProductAndCard[0].amount = 1;
        setCart([...cart, ...comparisonOfProductAndCard]);
        return;
      } else {
        const updatedCart = cart.map((productCart) => {
          if (productId === productCart.id) {
            const newAmount = (productCart.amount = productCart.amount + 1);

            return {
              ...productCart,
              amount: newAmount,
            };
          }

          return productCart;
        });
        setCart([...updatedCart]);
        return;
      }
    } catch {
      toast.error("Erro na adição do produto");
    }
  };

  const removeProduct = (productId: number) => {
    try {
      // TODO
    } catch {
      // TODO
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      products.map((product) => {
        if (product.id === productId) {
          const updateProduct = {
            ...product,
            amount,
          };
          setCart([...cart]);
          localStorage.setItem("@RocketShoes:cart", JSON.stringify(cart));
        }
      });
    } catch {
      // TODO
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
