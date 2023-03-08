export const ForgotPasswordTemplate = (
  validationcode: string,
  userName: string,
) => `
  <div style="display: flex; width: 100%; align-items: center; flex-direction: column">
  <div style="width: 95%; margin: 0; padding-top: 20px; ">
    <section style="text-align: center;">
        <h3 style="color: #17538f; font-family: monospace; font-size: 25px">Olá, ${userName}</h3>
        <p style="color: #17538f; font-family: monospace; font-size: 20px">
          Você solicitou a troca da sua senha, segue o código para prosseguir com a alteração, caso não tenha sido
          você a fazer a solicitação favor desconsiderar esse email.
        </p>
    </section>
    <section style="text-align: center">
      <h4 style="font-size: 25px; background: #f5f7f9; padding:10px 15px; border-radius: 10px; max-width: 150px; display: flex; align-items:center; justify-content:center">
        ${validationcode}
      </h4>
    </section>
  </div>
</div>
`;
