import {
  FormControl,
  FormErrorMessage,
  FormLabel,
  Select,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { Genre } from "~/lib/types";
import api from "~/utils/api";

interface GenreSelectProps {
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  label?: string;
  error?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  addAllGenres?: boolean;
}

const GenreSelect: React.FC<GenreSelectProps> = ({
  name,
  value,
  onChange,
  error,
  placeholder,
  label = "",
  addAllGenres = false,
  required = false,
  disabled = false,
}) => {
  const [genres, setGenres] = useState<Genre[]>([]);

  useEffect(() => {
    async function getGenres() {
      try {
        const { data } = await api.get<Genre[]>("genres");
        setGenres(data);
      } catch (err) {
        setGenres([]);
      }
    }
    getGenres();
  }, []);

  return (
    <FormControl
      paddingY={2}
      id={name}
      isRequired={required}
      isInvalid={!!error}
    >
      {label && <FormLabel>Genre</FormLabel>}
      <Select
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        isDisabled={disabled}
      >
        {addAllGenres && <option value="">All Genres</option>}
        {genres.map((g, i) => (
          <option key={i} value={g.slug}>
            {g.name}
          </option>
        ))}
      </Select>
      <FormErrorMessage>{error}</FormErrorMessage>
    </FormControl>
  );
};

export default GenreSelect;
