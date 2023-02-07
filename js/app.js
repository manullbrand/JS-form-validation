import { valida } from "./validacao.js";

const inputs = document.querySelectorAll("input");

inputs.forEach((input) => {
  if (input.dataset.tipo === "preco") {
    /* Tudo isso peguei do github, já pronto, para poder usar essa "mask" na aba de cadastro de preços. Aqui estou só configurando-a. O professorzinho retirou várias coisas do código original (p. ex. valor negativo) já que não iremos usar para cadastrar preços. */
    SimpleMaskMoney.setMask(input, {
      prefix: "R$ ",
      fixed: true,
      fractionDigits: 2,
      decimalSeparator: ",",
      thousandsSeparator: ".",
      cursor: "end",
    });
  }

  input.addEventListener("blur", (evento) => {
    valida(evento.target);
  });
});
