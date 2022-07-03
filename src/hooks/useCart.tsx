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
  stocks: Stock[];
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
  const [stocks, setStocks] = useState<Stock[]>([]);

  useEffect(() => {
    api.get("products").then((response) => setProducts(response.data));
  }, []);

  useEffect(() => {
    api.get("stock").then((response) => setStocks(response.data));
  }, []);

  const addProduct = async (productId: number) => {
    try {
      const comparisonOfProductAndCard = products.filter((product) =>
        product.id === productId ? product : null
      ); // aqui está o produto do carrinho

      const alreadyInCart = cart.find((productCart) =>
        productCart.id === comparisonOfProductAndCard[0].id ? true : false
      );

      if (!alreadyInCart) {
        comparisonOfProductAndCard[0].amount = 1;
        setCart([...cart, ...comparisonOfProductAndCard]);
        localStorage.setItem(
          "@RocketShoes:cart",
          JSON.stringify([...cart, ...comparisonOfProductAndCard])
        );
      } else {
        const updatedCart = cart.map((productCart) => {
          if (productId === productCart.id) {
            const stock = stocks.find(
              (stock) => stock.id === productCart.id
            ) || { id: 0, amount: 0 };
            if (productCart.amount < stock.amount) {
              const newAmount = (productCart.amount = productCart.amount + 1);
              return {
                ...productCart,
                amount: newAmount,
              };
            } else {
              toast.error("Quantidade solicitada fora de estoque");
            }
          }
          return productCart;
        });
        setCart([...updatedCart]);
        localStorage.setItem(
          "@RocketShoes:cart",
          JSON.stringify([...updatedCart])
        );
      }
    } catch {
      toast.error("Erro na adição do produto");
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const removeProduct = cart.filter((product) =>
        product.id !== productId ? product : null
      );
      setCart([...removeProduct]);
      localStorage.setItem(
        "@RocketShoes:cart",
        JSON.stringify([...removeProduct])
      );
    } catch {
      toast.error("Erro na remoção do produto");
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      setCart([...cart]);
      localStorage.setItem("@RocketShoes:cart", JSON.stringify(cart));
    } catch {
      toast.error("Erro na alteração de quantidade do produto");
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount, stocks }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
