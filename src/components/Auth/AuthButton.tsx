import {
  Link as ChakraLink,
  Box,
  Button,
  ButtonProps,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from "@chakra-ui/react";
import React, { useState } from "react";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

export type AuthCommonType = "login" | "register";

interface AuthButtonProps {
  initialAuthType: AuthCommonType;
}

const AuthButton: React.FC<AuthButtonProps & ButtonProps> = ({
  initialAuthType,
  ...props
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { children, ...buttonProps } = props;
  const [authType, setAuthType] = useState<AuthCommonType>(initialAuthType);
  return (
    <React.Fragment>
      <Button onClick={onOpen} {...buttonProps}>
        {!children
          ? (initialAuthType === "login" && "LOGIN") ||
            (initialAuthType === "register" && "REGISTER")
          : children}
      </Button>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {authType === "login" && "Login"}
            {authType === "register" && "Register"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody paddingBottom={5}>
            {authType === "login" && <LoginForm />}
            {authType === "register" && <RegisterForm />}
          </ModalBody>
          <ModalFooter alignItems="center" justifyContent="center">
            <Box textAlign="center">
              {authType === "login" && (
                <ChakraLink onClick={() => setAuthType("register")}>
                  Do not have an account? Create an account today.
                </ChakraLink>
              )}
              {authType === "register" && (
                <ChakraLink onClick={() => setAuthType("login")}>
                  Already have an account? Login here.
                </ChakraLink>
              )}
            </Box>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </React.Fragment>
  );
};

export default AuthButton;
