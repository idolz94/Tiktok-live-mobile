import { images } from "@assets/images";

export type FakeDataType = {
  key: number;
  name: string;
  tiktokId: string;
  logo: string;
  isSelected: boolean;
};

export const fakeDataChannel: Array<FakeDataType> = [
  {
    key: 1,
    name: "Nguyễn Văn Anh",
    tiktokId: "@conlavungday02",
    logo: images.logo_app,
    isSelected: false,
  },
  {
    key: 2,
    name: "Nguyễn Văn Bình",
    tiktokId: "@binhxangcon1102",
    logo: images.logo_app,
    isSelected: false,
  },
  {
    key: 3,
    name: "Nguyễn Văn Chung",
    tiktokId: "@chungtinh123",
    logo: images.logo_app,
    isSelected: false,
  },
];
