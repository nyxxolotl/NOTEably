# Use the official Maven image with Java 17 for the build stage
FROM maven:3.8.1-openjdk-17 AS build

# Set the working directory in the container
WORKDIR /app

# Copy the pom.xml and install dependencies
COPY pom.xml .
RUN mvn clean install

# Copy the source code
COPY src /app/src

# Package the application as a JAR
RUN mvn package -DskipTests

# Use OpenJDK 17 for the runtime stage
FROM openjdk:17-jre-slim

# Copy the JAR file from the build stage
COPY --from=build /app/target/*.jar /app/app.jar

# Expose the port that the application will run on
EXPOSE 8080

# Command to run the Spring Boot application
CMD ["java", "-jar", "/app/app.jar"]
