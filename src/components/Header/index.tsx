import {
  CloseIcon,
  HamburgerIcon,
  MoonIcon,
  SearchIcon,
  SunIcon,
} from "@chakra-ui/icons";
import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Icon,
  IconButton,
  Menu,
  MenuButton,
  MenuDivider,
  MenuGroup,
  MenuItem,
  MenuList,
  Stack,
  useColorMode,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import React from "react";
import { FaCloudUploadAlt, FaUserAlt } from "react-icons/fa";
import NextLink from "next/link";
import VolumeSliderHeader from "./VolumeSliderHeader";
import useUser from "~/lib/contexts/user_context";
import AuthButton from "../Auth/AuthButton";
import Container from "../Shared/Container";

interface HeaderNavLinkProps {
  href: string;
  color?: string;
  icon?: React.ReactElement;
}

const HeaderNavLink: React.FC<HeaderNavLinkProps> = ({
  href,
  color,
  icon,
  children,
}) => (
  <NextLink href={href}>
    <Button variant="ghost" colorScheme={color} size="sm" leftIcon={icon}>
      {children}
    </Button>
  </NextLink>
);

interface HeaderProps {}

const Header: React.FC<HeaderProps> = (props) => {
  const { user, logout } = useUser();
  const { toggleColorMode } = useColorMode();
  const ColorModeIcon = useColorModeValue(MoonIcon, SunIcon);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const HeaderNavLinks = (
    <React.Fragment>
      <HeaderNavLink href="#" icon={<SearchIcon />}>
        Search
      </HeaderNavLink>
      {user && (
        <HeaderNavLink
          color="primary"
          href="/upload"
          icon={<FaCloudUploadAlt />}
        >
          Upload
        </HeaderNavLink>
      )}
    </React.Fragment>
  );

  const UserMenu = user ? (
    <Box zIndex={4}>
      <Menu placement="bottom-end">
        <MenuButton
          as={IconButton}
          icon={<FaUserAlt />}
          variant="ghost"
          colorScheme="primary"
        >
          Profile
        </MenuButton>
        <MenuList>
          <MenuGroup title={user.username}>
            <NextLink href={`/users/${user.username}`}>
              <MenuItem>Profile</MenuItem>
            </NextLink>
            <NextLink href="/setting">
              <MenuItem>Settings</MenuItem>
            </NextLink>
          </MenuGroup>
          <MenuDivider />
          <MenuItem onClick={async () => await logout()}>Logout</MenuItem>
        </MenuList>
      </Menu>
    </Box>
  ) : (
    <>
      <AuthButton authType="login" />
      <AuthButton authType="register" display={{ base: "none", md: "flex" }} />
    </>
  );

  return (
    <React.Fragment>
      <Box as="header" px={4} borderColor="primary.500" borderBottomWidth={4}>
        <Container py="3">
          <Flex h={16} alignItems="center" justifyContent="space-between">
            <IconButton
              variant="ghost"
              size="lg"
              icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
              aria-label="Open menu"
              display={{ md: !isOpen ? "none" : "inherit" }}
              onClick={isOpen ? onClose : onOpen}
            />
            <HStack as="nav" spacing={4} display={{ base: "none", md: "flex" }}>
              <Heading display={{ base: "none", md: "flex" }}>
                Audiochan
              </Heading>
              {HeaderNavLinks}
            </HStack>
            <Flex alignItems="center">
              <HStack spacing={4}>
                <IconButton
                  aria-label="Change color mode"
                  icon={<ColorModeIcon />}
                  size="md"
                  variant="ghost"
                  onClick={toggleColorMode}
                />
                <VolumeSliderHeader />
                {UserMenu}
              </HStack>
            </Flex>
          </Flex>
        </Container>
        {isOpen && (
          <Box pb={4}>
            <Stack as="nav" spacing={4}>
              {HeaderNavLinks}
            </Stack>
          </Box>
        )}
      </Box>
    </React.Fragment>
  );
};

export default Header;
