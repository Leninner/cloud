```bash
# Create a container from the ubuntu image
docker run -it --rm ubuntu:22.04

# Make a directory and store a file in it
mkdir my-data
echo "Hello world from Docker" > my-data/hello.txt

# Confirm the file is there
cat my-data/hello.txt
exit
```

Si creamos de nuevo el contenedor, veremos que el fichero no está, ya que el contenedor se ha eliminado.

```bash
docker run -it --rm ubuntu:22.04
cat my-data/hello.txt
exit
```