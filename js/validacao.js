// Esse código não é uma boa prática, pois pegar input por seletor é muito específico. Se você precisar do mesmo código para outro seletor, o códgio começa inchado. Então faço um "export" de uma function de validação, como fiz log abaixo.
//const dataNascimento = document.querySelector("#nascimento");

// dataNascimento.addEventListener("blur", (evento) => {
//   validaDataNascimento(evento.target);
// });

export function valida(input) {
  const tipoDeInput = input.dataset.tipo;

  if (validadores[tipoDeInput]) {
    validadores[tipoDeInput](input);
  }

  if (input.validity.valid) {
    input.parentElement.classList.remove("input-container--invalido");
    input.parentElement.querySelector(".input-mensagem-erro").innerHTML = "";
  } else {
    input.parentElement.classList.add("input-container--invalido");
    input.parentElement.querySelector(".input-mensagem-erro").innerHTML =
      mostraMensagemDeErro(tipoDeInput, input);
  }
}

const tiposDeErro = [
  "valueMissing",
  "typeMismatch",
  "patternMismatch",
  "customError",
];

const mensagensDeErro = {
  nome: {
    valueMissing: "O campo Nome não pode estar vazio.",
  },
  email: {
    valueMissing: "O campo E-mail não pode estar vazio.",
    typeMismatch: "O E-mail digitado não é válido.",
  },
  senha: {
    valueMissing: "O campo de Senha não pode estar vazio.",
    patternMismatch:
      "A senha deve conter entre 6 e 12 caracteres, deve conter pelo menos uma letra maiúscula, um número, e não deve conter símbolos.",
  },
  dataNascimento: {
    valueMissing: "O campo de Data de Nascimento não pode estar vazio.",
    customError: "Você deve ser maior de idade para se cadastrar.",
  },
  cpf: {
    valueMissing: "O campo de CPF não pode estar vazio.",
    customError: "O CPF digitado não é válido.",
  },
  cep: {
    valueMissing: "O campo de CEP não pode estar vazio.",
    patternMismatch: "O CEP digitado não é válido.",
    customError: "CEP não encontrado.",
  },
  logradouro: {
    valueMissing: "o campo de logradouro não pode estar vazio.",
  },
  cidade: {
    valueMissing: "o campo de cidade não pode estar vazio.",
  },
  estado: {
    valueMissing: "o campo dde estado não pode estar vazio.",
  },
  preco : {
    valueMissing: "o campo de preço não pode estar vazio."
  }
};

const validadores = {
  dataNascimento: (input) => validaDataNascimento(input),
  cpf: (input) => validaCPF(input),
  cep: (input) => recuperarCEP(input),
};

function mostraMensagemDeErro(tipoDeInput, input) {
  let mensagem = "";
  /* deixo sem nada pois a mensagem vai depender de qual input não está preenchido e, portanto, dando erro */
  tiposDeErro.forEach((erro) => {
    if (
      input.validity[erro]
      /* Significa que vai checar o input e ver se tem um erro hipotético. Se sim, o retorno desse if é um booleano 'true', daí entra na condição. */
    ) {
      mensagem = mensagensDeErro[tipoDeInput][erro];
    }
  });

  return mensagem;
}

function validaDataNascimento(input) {
  const dataRecebida = new Date(input.value);
  let mensagem = "";

  if (!maiorQue18(dataRecebida)) {
    mensagem = "Você deve ser maior de idade para se cadastrar.";
  }

  input.setCustomValidity(mensagem);
}

function maiorQue18(data) {
  const dataAtual = new Date(); // vazio assim, ele pega a data de hoje.
  const dataMais18 = new Date(
    data.getUTCFullYear() + 18,
    data.getUTCMonth(),
    data.getUTCDate()
  );

  return dataMais18 <= dataAtual;
}

function validaCPF(input) {
  const cpfFormatado = input.value.replace(/\D/g, "");
  /* Regex que significa que tudo oq NAO for dígito será substituído por nada, ''. Faço isso para tirar pontinhos e hífens que as pessoas podem digitar quando estão preenchendo um CPF. */
  let mensagem = "";

  if (!checaCPFRepetido(cpfFormatado) || !checaEstruturaCPF(cpfFormatado)) {
    mensagem = "O CPF digitado não é válido.";
  }
  input.setCustomValidity(mensagem);
}

function checaCPFRepetido(cpf) {
  const valoresRepetidos = [
    "00000000000",
    "11111111111",
    "22222222222",
    "33333333333",
    "44444444444",
    "55555555555",
    "66666666666",
    "77777777777",
    "88888888888",
    "99999999999",
  ];

  let cpfValido = true;

  valoresRepetidos.forEach((valor) => {
    if (valor === cpf) {
      cpfValido = false;
    }
  });

  return cpfValido;
}

function checaEstruturaCPF(cpf) {
  const multiplicador = 10;

  return checaDigitoVerificador(cpf, multiplicador);
}

/* A validação do CPF se baseia nessa ideia: 
123 456 789 09
let soma = (11 * 1) + (10 * 2) + (9 * 3) ... (2 * 0)
let digitoVerificador = 11 - (soma % 11)
Assim, nessa função aí de baixo, é isso que vamos escrever:
*/
function checaDigitoVerificador(cpf, multiplicador) {
  if (multiplicador >= 12) {
    return true;
  }

  let multiplicadorInicial = multiplicador;
  let soma = 0;
  const cpfSemDigitos = cpf.substr(0, multiplicador - 1).split("");
  /* a função substring (substr) corta minha array nas posições que eu estipulo aqui. */
  const digitoVerificador = cpf.charAt(multiplicador - 1);
  /* o charAt me permite estipular a posiçao especifica que eu estou querendo pegar. */

  for (let contador = 0; multiplicadorInicial > 1; multiplicadorInicial--) {
    soma = soma + cpfSemDigitos[contador] * multiplicadorInicial;
    contador++;
  }

  if (digitoVerificador === confirmaDigito(soma)) {
    return checaDigitoVerificador(cpf, multiplicador + 1);
  }

  return false;
}

function confirmaDigito(soma) {
  return 11 - (soma % 11);
}

function recuperarCEP(input) {
  const cep = input.value.replace(/\D/g, "");
  /* significa: queremos substituir tudo oq não for número por "nada" */

  /* agora aqui vou fazer uma requisição para uma API que, assim que o cliente se cadastrar com seu cep, as demais informações de endereço serão automaticamente completadas graças a essa API. Essas informações abaixo são necessárias para fazer o 'fetch'. */
  const url = `https://viacep.com.br/ws/${cep}/json/`;
  const options = {
    method: "GET",
    mode: "cors",
    headers: {
      "content-type": "application/json; charset=utf-8",
    },
  };

  if (!input.validity.patternMismatch && !input.validity.valueMissing) {
    fetch(url, options)
      .then((response) => response.json())
      .then((data) => {
        if (data.erro) {
          input.setCustomValidity("CEP não encontrado");
          return;
        }
        input.setCustomValidity("");
        preencheCamposComCEP(data);
        return;
      });
  }
}

function preencheCamposComCEP(data) {
  const logradouro = document.querySelector('[data-tipo="logradouro"]');
  const cidade = document.querySelector('[data-tipo="cidade"]');
  const estado = document.querySelector('[data-tipo="estado"]');

  /* todas essas informações de data aparecem dessa forma quando consulto a API retornadano console através do inspect da página */
  logradouro.value = data.logradouro;
  cidade.value = data.localidade;
  estado.value = data.uf;
}
