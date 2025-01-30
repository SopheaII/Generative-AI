import { TokenPayload } from '../common/types/user';
import * as jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { RoleEnum, RoleType } from '../common';


// Middleware to protect routes and check roles
const apiKey = "a3f1c2b4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b9c0d1e2"

const protectRoute = (roles: RoleType[] = [RoleEnum[2]]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    const apiKeyRequest =req.headers["x-api-key"] as string;
    console.log(apiKeyRequest,"..................."); 
    if(apiKeyRequest != apiKey){
      return res.status(401).json({message:"API key required"})
    }

    // Check if Authorization header exists and starts with "Bearer"
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Access denied, no token provided or invalid format",
      });
    }

    const token = authHeader.split(" ")[1]; // Extract the token after "Bearer"
    
    // Check if Authorization header exists and starts with "Bearer"
    if (!token ) {
      return res.status(401).json({
        message: "Access denied, no token provided or invalid format",
      });
    }
    
    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "") as TokenPayload;
      req.user = decoded;

      if (!roles.includes(decoded.role)) {
        return res
          .status(403)
          .json({ message: "Forbidden: You do not have the right role" });
      }

      next(); // Move to the next middleware or the route handler
    } catch (err) {
      console.log("error: ", err)
      res.status(401).json({ message: "Invalid token" });
    }
  };
};

export default protectRoute;
