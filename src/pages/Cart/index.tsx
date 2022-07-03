import React from "react";
import { useState } from "react";
import {
  MdDelete,
  MdAddCircleOutline,
  MdRemoveCircleOutline,
} from "react-icons/md";
import { toast } from "react-toastify";

import { useCart } from "../../hooks/useCart";
import { formatPrice } from "../../util/format";
import { Container, ProductTable, Total } from "./styles";

interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
  amount: number;
}

const Cart = (): JSX.Element => {
  const { cart, removeProduct, updateProductAmount, stocks } = useCart();

  // const cartFormatted = cart.map((product) => ({
  //   // TODO
  // }));
  const [total, setTotal] = useState<number>(() => {
    return cart.reduce((sumTotal, product) => {
      return sumTotal + product.price * product.amount;
    }, 0);
  });

  function updateValue() {
    return cart.reduce((sumTotal, product) => {
      return sumTotal + product.price * product.amount;
    }, 0);
  }
  function handleProductIncrement(product: Product) {
    const stock = stocks.find((stock) => stock.id === product.id) || {
      id: 0,
      amount: 0,
    };

    if (product.amount < stock.amount) {
      const incrementAmount = (product.amount += 1);
      updateProductAmount({
        productId: product.id,
        amount: incrementAmount,
      });
    } else {
      toast.error("Quantidade solicitada fora de estoque");
    }

    setTotal(updateValue());
  }

  function handleProductDecrement(product: Product) {
    if (product.amount > 1) {
      const decrementAmount = (product.amount -= 1);
      updateProductAmount({
        productId: product.id,
        amount: decrementAmount,
      });
    }

    setTotal(updateValue());
  }

  function handleRemoveProduct(productId: number) {
    console.log(cart);

    const removeProductOfCart = cart.filter(
      (product) => product.id === productId
    );

    const minus = removeProductOfCart[0].amount * removeProductOfCart[0].price;
    removeProduct(productId);
    setTotal(updateValue() - minus);
  }

  return (
    <Container>
      <ProductTable>
        <thead>
          <tr>
            <th aria-label="product image" />
            <th>PRODUTO</th>
            <th>QTD</th>
            <th>SUBTOTAL</th>
            <th aria-label="delete icon" />
          </tr>
        </thead>
        <tbody>
          {cart.map((cart) => {
            return (
              <tr data-testid="product" key={cart.id}>
                <td>
                  <img src={cart.image} alt={cart.title} />
                </td>
                <td>
                  <strong>{cart.title}</strong>
                  <span>{formatPrice(cart.price)}</span>
                </td>
                <td>
                  <div>
                    <button
                      type="button"
                      data-testid="decrement-product"
                      disabled={cart.amount <= 1}
                      onClick={() => handleProductDecrement(cart)}
                    >
                      <MdRemoveCircleOutline size={20} />
                    </button>
                    <input
                      type="text"
                      data-testid="product-amount"
                      readOnly
                      value={cart.amount}
                    />
                    <button
                      type="button"
                      data-testid="increment-product"
                      onClick={() => handleProductIncrement(cart)}
                    >
                      <MdAddCircleOutline size={20} />
                    </button>
                  </div>
                </td>
                <td>
                  <strong>{formatPrice(cart.price)}</strong>
                </td>
                <td>
                  <button
                    type="button"
                    data-testid="remove-product"
                    onClick={() => handleRemoveProduct(cart.id)}
                  >
                    <MdDelete size={20} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </ProductTable>

      <footer>
        <button type="button">Finalizar pedido</button>
        <Total>
          <span>TOTAL</span>
          <strong>{formatPrice(Number(total))}</strong>
        </Total>
      </footer>
    </Container>
  );
};

export default Cart;
