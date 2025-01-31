import styled from "@emotion/styled";

const MainBg = styled.div`
  width: 414px;
  height: 896px;

  background: #5d7e9e;
`;

const MainBgHeader = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 2px 0px;

  width: 414px;
  height: 44px;

  background: #5d7e9e;

  flex: none;
  order: 1;
  align-self: stretch;
  flex-grow: 0;

  width: 398px;
  height: 22px;

  font-family: "Roboto";
  font-style: normal;
  font-weight: 400;
  font-size: 16px;
  line-height: 22px;

  display: flex;
  align-items: center;

  color: #ffffff;

  flex: none;
  order: 2;
  flex-grow: 1;
`;

const ActionBar = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 2px;
  gap: 2px;

  position: absolute;
  height: 170px;
  left: 0px;
  right: 0px;
  bottom: 0px;

  background: #ffffff;

  box-shadow: 0px -2px 4px rgba(0, 0, 0, 0.24);
`;

const RegisterForm = styled.form`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 16px;
  gap: 16px;

  width: 410px;
  height: 124px;
`;

const FormField = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0px;
  gap: 5px;
  width: 378px;
`;

const FormLabel = styled.label`
  display: block;
  padding: 0px;

  width: 378px;
  height: 13px;

  font-family: "Roboto";
  font-weight: 400;
  font-size: inherit;
  line-height: 13px;

  color: rgba(0, 0, 0, 0.38);
`;

const FormInput = styled.input`
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: flex-start;
  padding: 0px;
  gap: 2px;

  width: 378px;
  height: 21px;

  align-self: stretch;
  flex-grow: 0;

  border-color: rgba(15, 125, 255, 0.24);
  border-width: 0 0 3px 0;

  ::placeholder {
    font-family: "Roboto";
    font-size: 14px;
    line-height: 16px;

    color: rgba(0, 0, 0, 0.24);
  }
`;

export {
  MainBg,
  MainBgHeader,
  ActionBar,
  RegisterForm,
  FormField,
  FormInput,
  FormLabel,
};
