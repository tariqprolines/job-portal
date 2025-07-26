export const getInitials = (userName: any) => {
    const initials = userName
      ?.split(" ")
      ?.map((word: any) => word[0])
      ?.join("");
    return initials?.substring(0, 2)?.toUpperCase();
  };