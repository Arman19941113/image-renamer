# Image Renamer

Download APP: [MacOS](https://github.com/Arman19941113/image-renamer/releases/download/v0.0.2/ImageRenamer-0.0.2.dmg) [Windows](https://github.com/Arman19941113/image-renamer/releases/download/v0.0.2/ImageRenamer.Setup.0.0.2.exe)

### A cross-platform jpg files rename tool.

![home](./assets/Home.jpg)

### This only works with jpg files with exif data.

![result](./assets/Result.jpg)

## Usage

### Case you used the exif variables: `{YYYY}`, `{MM}`, `{DD}`, `{hh}`, `{mm}`, `{ss}`, `{make}`, `{model}`, `{lens}`

#### 1. The best case is renaming jpg file with exif data.

![example](./assets/example-001.png)

#### 2. If the jpg file is lack of some variable like `{lens}`, the variable will be replaced with string of `{lens}`.

![example](./assets/example-002.png)

#### 3. If your file does't exist exif data, this app won't modify your filename.

![example](./assets/example-003.png)

### Case you just use the `sequence` variable

#### 1. This app will rename all files unless the filename is conflict. So you'd better make sure you the `seqnence` is big enough to guarantee the uniqueness of the filename.

![example](./assets/example-001.png)
